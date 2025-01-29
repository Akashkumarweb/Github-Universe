'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TimeIndicator() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    const rotation = (currentHour + currentMinute / 60) * 15; // 15 degrees per hour

    return (
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 50 }}
        >
            <div className="w-1 h-16 bg-pulsar-pink rounded-full origin-top" />
        </motion.div>
    );
}