'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimate } from 'framer-motion';

const colors = {
    JavaScript: '#F0DB4F',
    Python: '#3572A5',
    TypeScript: '#3178C6',
    React: '#61DAFB',
    Node: '#8CC84B',
    Default: '#49A6D4'
};

export default function SkillEcosystem({ languages }) {
    const [scope, animate] = useAnimate();
    const [selectedSkill, setSelectedSkill] = useState(null);

    useEffect(() => {
        if (!languages) return;

        const total = Object.values(languages).reduce((a, b) => a + b, 0);
        const circles = Object.entries(languages).map(([lang, count], i) => {
            const size = Math.sqrt(count / total) * 200 + 30;
            const angle = (i / Object.keys(languages).length) * Math.PI * 2;

            return {
                lang,
                size,
                x: Math.cos(angle) * 150,
                y: Math.sin(angle) * 150,
                color: colors[lang] || colors.Default
            };
        });

        circles.forEach((circle, i) => {
            animate(
                `.lang-${i}`,
                {
                    width: circle.size,
                    height: circle.size,
                    x: circle.x,
                    y: circle.y
                },
                { type: 'spring', stiffness: 50, delay: i * 0.1 }
            );
        });
    }, [languages]);

    if (!languages) return null;

    return (
        <div className="bg-black/30 p-8 rounded-2xl backdrop-blur-lg border border-nebula-purple mt-8">
            <h2 className="text-xl font-bold text-stardust-white mb-6">Skill Ecosystem</h2>
            <div ref={scope} className="relative h-96">
                {Object.entries(languages).map(([lang, count], i) => (
                    <motion.div
                        key={lang}
                        className={`absolute lang-${i} rounded-full flex items-center justify-center cursor-pointer
              ${selectedSkill === lang ? 'z-50' : 'z-30'}`}
                        initial={{ width: 0, height: 0, x: 0, y: 0 }}
                        style={{ backgroundColor: colors[lang] || colors.Default }}
                        onHoverStart={() => setSelectedSkill(lang)}
                        onHoverEnd={() => setSelectedSkill(null)}
                    >
                        <motion.div
                            className="text-space-black font-bold text-center px-4"
                            animate={{ scale: selectedSkill === lang ? 1.2 : 1 }}
                        >
                            {lang}
                            <div className="text-xs mt-1">{count} repos</div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}