'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TimeIndicator from './TimeIndicator';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CodePulse({ username }) {
    const [activity, setActivity] = useState(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await fetch(`https://api.github.com/users/${username}/events/public`);
                const events = await response.json();

                const activityMap = events.reduce((acc, event) => {
                    const date = new Date(event.created_at);
                    const day = date.getDay();
                    const hour = date.getHours();

                    acc[day] = acc[day] || {};
                    acc[day][hour] = (acc[day][hour] || 0) + 1;

                    return acc;
                }, {});

                setActivity(activityMap);
            } catch (error) {
                console.error('Error fetching activity:', error);
            }
        };

        if (username) fetchActivity();
    }, [username]);

    if (!activity) return null;

    return (
        <div className="relative h-96 bg-background/30 rounded-2xl p-8 backdrop-blur-lg border border-nebula-purple">
            <h2 className="text-xl font-bold text-foreground mb-6">Code Pulse Rhythm</h2>

            <div className="relative w-full h-full">
                {/* Radial Grid */}
                {Array.from({ length: 7 }).map((_, radius) => (
                    <div
                        key={radius}
                        className="absolute inset-0 m-auto border rounded-full border-foreground/10"
                        style={{
                            width: `${(radius + 1) * 14}%`,
                            height: `${(radius + 1) * 14}%`,
                        }}
                    />
                ))}

                {/* Activity Points */}
                {Object.entries(activity).map(([day, hours]) =>
                    Object.entries(hours).map(([hour, count]) => {
                        const angle = (day / 6) * Math.PI * 2;
                        const radius = (hour / 23) * 45 + 5;

                        return (
                            <motion.div
                                key={`${day}-${hour}`}
                                className="relative cursor-pointer"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: Math.min(1 + count * 0.3, 2),
                                    opacity: Math.min(0.2 + count * 0.1, 1)
                                }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                                    top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                                }}
                                whileHover={{ scale: 2, zIndex: 10 }}
                                onHoverStart={() => setHoveredPoint({
                                    x: Math.cos(angle) * radius + 50,
                                    y: Math.sin(angle) * radius + 50,
                                    day: days[day],
                                    hour,
                                    count
                                })}
                                onHoverEnd={() => setHoveredPoint(null)}
                            >
                                <div className="w-2 h-2 bg-comet-blue rounded-full" />
                                <div className="absolute -inset-2 bg-pulsar-pink/20 rounded-full pointer-events-none" />
                            </motion.div>
                        );
                    })
                )}

                {/* Time Indicator */}
                <TimeIndicator />

                {/* Day Labels */}
                {days.map((day, index) => {
                    const angle = (index / 6) * Math.PI * 2;
                    return (
                        <div
                            key={day}
                            className="absolute text-sm text-foreground/60"
                            style={{
                                left: `calc(50% + ${Math.cos(angle) * 52}%)`,
                                top: `calc(50% + ${Math.sin(angle) * 52}%)`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {day}
                        </div>
                    );
                })}

                {/* Tooltip */}
                {hoveredPoint && (
                    <motion.div
                        className="absolute px-4 py-2 bg-space-black rounded-lg border border-nebula-purple pointer-events-none"
                        animate={{
                            opacity: 1,
                            left: `${hoveredPoint.x}%`,
                            top: `${hoveredPoint.y}%`
                        }}
                        initial={{ opacity: 0 }}
                    >
                        <p className="text-sm text-stardust-white">
                            {hoveredPoint.count} events<br />
                            {hoveredPoint.day} {hoveredPoint.hour}:00
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}