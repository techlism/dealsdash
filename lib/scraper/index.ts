"use server"
import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url : string) {
    if(!url) return;
    //bright data proxy configuration
    const userName = String(process.env.BRIGHT_DATA_USERNAME)  ;
    const password  = String(process.env.BRIGHT_DATA_PASSWORD) ;
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0 ;
    const options  = {
        auth :{
            username : `${userName}-session-${session_id}`,
            password
        },
        host : 'brd.superproxy.io',
        port,
        rejectUnauthorized : false
    }
    try {
        // Fetch product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);
        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price')
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );
        
        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g,'');

        const description= extractDescription($);

        const extractedStars =  $('.a-size-medium.a-color-base').text().match(/\d\.\d out of \d/);
        
        const reviewsCount = $('#acrCustomerReviewText').text().match(/(\d+ ratings)/);
        // console.log(reviewsCount);

        let cleanedDescriptionArray : String[] = String(description)
        .split("\n")
        .filter((line) => line.trim() !== "" && line.trim() !== ">" && line !== '>\n' && line !== '\n' && line!=='>')
        .map((line) => line.endsWith(">") ? line.slice(0, -1) : line);    
        const priceHistory : any[] = [] ;

        const data = {
            url,
            currency,
            image : imageUrls[0],
            title,
            currentPrice : Number(currentPrice) || Number(originalPrice),
            originalPrice : Number(originalPrice) || Number(currentPrice),
            priceHistory,
            discountRate: Number(discountRate),
            category : `${cleanedDescriptionArray[0]} ${cleanedDescriptionArray[1] === '>' ? '' : cleanedDescriptionArray[1]}`,
            reviewsCount : reviewsCount ? reviewsCount[0] : "No Ratings",
            stars : extractedStars ?  extractedStars[0] : 'No Ratings',
            isOutOfStock : outOfStock,
            description,
            // cleanedDescriptionArray,
            lowestPrice : Number(currentPrice) || Number(originalPrice),
            highestPrice : Number(originalPrice) || Number(currentPrice),
            averagePrice : Number(currentPrice) || Number(originalPrice)
        }
        // console.log(data.stars);
        return data;
    } catch (error:any) {
        throw new Error(`Failed to scrape product : ${error.message}`);
    }
}