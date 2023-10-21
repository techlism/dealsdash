"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
// import { redirect } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const isValidAmazonLink  = (url : string) : boolean =>{
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;
        if(hostname.includes('amazon.com') || hostname.includes('amazon.') || hostname.endsWith('amazon') || hostname.includes('amzn')){
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

const Searchbar = () =>{
    const [searchPrompt , setSearchPrompt] = useState('');
    const [isLoading , setLoading] =  useState(false);
    const router = useRouter();
    const handleSubmit = async (event : FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        const isValidLink = isValidAmazonLink(searchPrompt);
        if(!isValidLink) return alert("Not a valid Amazon link");
        try {
            setLoading(true);
            const scraped = await scrapeAndStoreProduct(searchPrompt);
            if(scraped !== '') router.push(scraped);
            // Product page will be scrapped here
        } catch (error) {
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }    

    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mt-12" id="searchbar">
        <input
          type="text"
          value={searchPrompt}
          onChange={(e)=>setSearchPrompt(e.target.value)}
          placeholder="Paste your Amazon product link"
          className="searchbar-input"
        />
        <button type="submit" className="searchbar-btn" disabled = {searchPrompt===''}>
            {isLoading ? 'Searching..' : 'Search'}
        </button>
      </form>
    );
}
export default Searchbar;