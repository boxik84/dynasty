'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import {
  Twitter,
  Youtube,
  Instagram,
  MapPin,
  Mail,
  ExternalLink,
  Users,
  Shield,
  Gamepad2,
  Heart
} from 'lucide-react';
import { Icons } from './icons';

const footerLinks = {
  server: [
    { name: 'Připojit se', href: siteConfig.links.fivem, external: true },
    { name: 'Pravidla', href: siteConfig.links.rules, external: true },
    { name: 'Whitelist', href: siteConfig.links.whitelist },
    { name: 'Statistiky', href: '/statistics' },
  ],
  komunita: [
    { name: 'Discord', href: siteConfig.links.discord, external: true },
    { name: 'Tým', href: '/team' },
    { name: 'Aktivity', href: '/aktivity' },
    { name: 'Podpora', href: siteConfig.links.support, external: true },
  ],
  legal: [
    { name: 'Podmínky použití', href: '/terms' },
    { name: 'Ochrana soukromí', href: '/privacy' },
    { name: 'Cookies', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'Discord', href: siteConfig.links.discord, icon: Icons.discord, color: 'hover:text-[#5865F2]' },
  { name: 'YouTube', href: siteConfig.links.youtube, icon: Youtube, color: 'hover:text-[#FF0000]' },
  { name: 'Instagram', href: siteConfig.links.instagram, icon: Instagram, color: 'hover:text-[#E4405F]' }
];

const stats = [
  { icon: Users, label: 'Aktivní hráči', value: '2000+' },
  { icon: Shield, label: 'Roky provozu', value: '3+' },
  { icon: Gamepad2, label: 'Aktivity', value: '50+' },
];

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#000000] text-white overflow-hidden border-t border-white/10">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b90505]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#b90505]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="sm:col-span-2 lg:col-span-1"
            >
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <Image
                  src="/logo.png"
                  alt="Retrovax Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {siteConfig.name}
                  </h3>
                  <p className="text-sm text-gray-400">Roleplay Server</p>
                </div>
              </Link>

              <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed">
                Prémiový český FiveM roleplay server s autentickým herním zážitkem,
                stabilní infrastrukturou a aktivní komunitou.
              </p>

              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-[#b90505]" />
                    <div className="text-base sm:text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              
              <div className="flex space-x-3 sm:space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-110 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </motion.div>

            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-6 flex items-center">
                <Gamepad2 className="h-5 w-5 mr-2 text-[#b90505]" />
                Server
              </h4>
              <ul className="space-y-3">
                {footerLinks.server.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      {link.name}
                      {link.external && (
                        <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#b90505]" />
                Komunita
              </h4>
              <ul className="space-y-3">
                {footerLinks.komunita.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      {link.name}
                      {link.external && (
                        <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#b90505]" />
                Právní informace
              </h4>
              <ul className="space-y-3 mb-6">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              
              <div className="bg-gradient-to-r from-[#b90505]/10 to-[#8a0101]/10 border border-[#b90505]/20 rounded-lg p-4">
                <h5 className="font-semibold mb-2 text-white">Rychlé připojení</h5>
                <p className="text-sm text-gray-300 mb-3">
                  Připoj se přímo na server
                </p>
                <Link href={siteConfig.links.fivem} target="_blank">
                  <Button
                    size="sm"
                    className="w-full bg-[#b90505] hover:bg-[#8a0101] text-white"
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Hrát nyní
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                <p>© 2025 {siteConfig.name}. Všechna práva vyhrazena.</p>
                <Separator orientation="vertical" className="hidden md:block h-4 bg-white/10" />
                <p className="flex items-center">
                  Vytvořeno s <Heart className="h-4 w-4 mx-1 text-red-500" /> pro českou FiveM komunitu
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Server online
                </div>
                <Separator orientation="vertical" className="h-4 bg-white/10" />
                <p>
                  Navrženo{' '}
                  <Link
                    href="https://github.com/Gojaneu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#b90505] transition-colors"
                  >
                    Gojan
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}