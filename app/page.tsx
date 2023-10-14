import Searchbar from "@/components/SearchBar";
import HeroCarousel from "@/components/HeroCarousel";
import Image from "next/image";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const allProducts = await getAllProducts().catch((error) =>
    console.log(`From Home : ${error}`)
  );
  return (
    <>
      <section className="border-red-500 px-6 border-2 md:px-20 py-24">
        <div className="flex  max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Effective Shopping Starts Here:
              <Image 
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>
            <h1 className="head-text">
              Unleash the Power of 
              <span className="text-primary"> DealsDash
              </span>
            </h1>
            <p className="mt-6">
              Track your Amazon product prices effortlessly. Get timely alerts straight to your email with our platform. Never miss a price drop again!            
            </p>
            <Searchbar/>
          </div>
          <HeroCarousel/>
        </div>
      </section>
      <section className="trending-section">
        <h2 className="section-text">Trending</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product)=>(
            <ProductCard product={product} key={product._id}/>
          ))}
        </div>
      </section>
    </>
  )
}
