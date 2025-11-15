'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { siteConfig } from "@/config/site";

const notFoundImg = "/404-computer.svg";

export default function NotFound() {
    const words = "Stránka nenalezena".split(" ");

    return (
        <section
            className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
        >
            
            <div className="pointer-events-none absolute left-1/3 top-2/5 z-0 -translate-x-1/2 -translate-y-1/2">
                <motion.div 
                    className="h-[300px] w-[600px] rounded-full bg-[#8a0101]/15 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
            <div className="pointer-events-none absolute left-2/3 top-3/4 z-0 -translate-x-1/2 -translate-y-1/2">
                <motion.div 
                    className="h-[250px] w-[500px] rounded-full bg-[#8a0101]/12 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.12, 0.2, 0.12],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute w-2 h-2 bg-[#8a0101]/30 rounded-full blur-sm"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.5, 0.5],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <div className="relative mx-auto max-w-7xl flex flex-col items-center justify-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-[#8a0101]/20 rounded-full blur-2xl" />
                    <Image
                        src={notFoundImg}
                        alt="404"
                        width={400}
                        height={400}
                        className="mx-auto select-none drop-shadow-2xl pointer-events-none relative z-10"
                        priority
                    />
                </motion.div>

                <h1 className="relative z-10 mx-auto max-w-4xl text-center font-bold text-white text-5xl lg:text-6xl mb-6">
                    {words.map((word, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, filter: "blur(4px)", y: 20 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            transition={{ 
                                duration: 0.6, 
                                delay: index * 0.2, 
                                ease: [0.25, 0.46, 0.45, 0.94] 
                            }}
                            className="mr-3 inline-block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
                        >
                            {word}
                        </motion.span>
                    ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-lg md:text-xl font-medium text-gray-300 mb-10 text-center max-w-2xl leading-relaxed"
                >
                    Jejda! Tato stránka neexistuje nebo byla přesunuta.
                    <br />
                    <span className="text-gray-400">Zkuste se vrátit zpět na domovskou stránku.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link href="/" passHref>
                        <Button
                            size="lg"
                            className="group px-8 py-4 bg-[#8a0101] hover:bg-[#570000] text-white font-semibold rounded-xl shadow-xl ring-2 ring-[#8a0101]/30 hover:ring-[#8a0101]/50 transition-all duration-300 cursor-pointer hover:scale-105"
                        >
                            <Home className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                            Domovská stránka
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.history.back()}
                        className="group px-8 py-4 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 font-semibold rounded-xl cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                        Zpět
                    </Button>
                </motion.div>

                
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="mt-16 text-center"
                >
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <span>Error 404</span>
                        <div className="w-1 h-1 bg-gray-500 rounded-full" />
                        <span>Retrovax FiveM</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}