"use server"

import { connectToDB } from "../mongoose"; // Here is mongoose is our connection script (Name is confusing)
import { scrapeAmazonProduct } from "../scraper";
import Product from "../models/product.model";
import { revalidatePath } from "next/cache";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import mongoose from "mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer/index";
import { User } from "@/types";



export async function scrapeAndStoreProduct(productUrl : string) {
    if(productUrl){
        try {
            connectToDB();
            const scrapedProduct = await scrapeAmazonProduct(productUrl);
            if(scrapedProduct){
                const existingProduct = await Product.findOne({url :scrapedProduct.url });
                let product = scrapedProduct;
                if(existingProduct) {
                    const updatedPriceHistory = [
                        ...existingProduct.priceHistory,
                        {price : scrapedProduct.currentPrice}
                    ]
                    product = {
                        ...scrapedProduct,
                        priceHistory : updatedPriceHistory,
                        lowestPrice : getLowestPrice(updatedPriceHistory),
                        highestPrice : getHighestPrice(updatedPriceHistory),
                        averagePrice : getAveragePrice(updatedPriceHistory)
                    }
                }
                const newProduct  = await Product.findOneAndUpdate({url : scrapedProduct.url},
                    product,
                    // Upsert is like if present then update else create an new instance for that
                    {upsert : true, new : true}
                );
                
                // path = `/products/${newProduct._id}` ;
                revalidatePath(`/products/${newProduct._id}`);
                return `/products/${newProduct._id}`;
            }
        } 
        catch (error:any) {
            throw new Error(`Failed to Scrape or Update product : ${error.message}`);
        }
    }
    return '';
}

export async function getProductById(productId: string) {
    try {
      connectToDB();
  
      const product = await Product.findOne({ _id: productId });
  
      if(!product) return null;
  
      return product;
    } catch (error : any) {
      console.log(`Error in Fetching Product by Id : ${error.message}`);
    }
}

export async function getAllProducts() {
    try {
      connectToDB();
  
      const products = await Product.find();
  
      return products;
    } catch (error : any) {
      console.log(`Error in getting all the products : ${error.message}`);
    }
}
  
export async function getSimilarProducts(productId: string) {
try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
    _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
} catch (error) {
    console.log(error);
}
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
      const product = await Product.findById(productId);
  
      if(!product) return;
  
      const userExists = product.users.some((user: User) => user.email === userEmail);
  
      if(!userExists) {
        product.users.push({ email: userEmail });
  
        await product.save();
  
        const emailContent = await generateEmailBody(product, "WELCOME");
  
        await sendEmail(emailContent, [userEmail]);
      }
    } catch (error) {
      console.log(error);
    }
  }