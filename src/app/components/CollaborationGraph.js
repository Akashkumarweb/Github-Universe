'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

export default function CollaborationGraph({ username }) {
    const svgRef = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!username) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/github/connections?username=${username}`);

                // Check for HTML response
                const contentType = response.headers.get('content-type');
                if (!contentType?.includes('application/json')) {
                    throw new Error('Server returned unexpected response format');
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load connection data');
                }

                if (!data.nodes || !data.links) {
                    throw new Error('Invalid data format received from server');
                }

                setData(data);

            } catch (error) {
                console.error('Connection Graph Error:', error);
                setError(error.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    useEffect(() => {
        if (!data || !svgRef.current) return;

        const width = 800;
        const height = 600;

        const svg = d3.select(svgRef.current)
            .html('') // Clear previous
            .attr('viewBox', `0 0 ${width} ${height}`);

        // Create force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Create links
        const link = svg.append('g')
            .selectAll('line')
            .data(data.links)
            .join('line')
            .attr('stroke', '#5F2C82')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 1.5);

        // Create nodes
        const node = svg.append('g')
            .selectAll('circle')
            .data(data.nodes)
            .join('circle')
            .attr('r', d => d.type === 'main' ? 12 : 8)
            .attr('fill', d =>
                d.type === 'main' ? '#FF3CAC' :
                    d.type === 'follower' ? '#49A6D4' : '#5F2C82'
            )
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
            );

        // Add labels
        const label = svg.append('g')
            .selectAll('text')
            .data(data.nodes)
            .join('text')
            .text(d => d.id)
            .attr('font-size', 10)
            .attr('dx', 15)
            .attr('dy', 4)
            .attr('fill', '#F0F4FC');

        // Update positions
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => simulation.stop();
    }, [data]);

    if (error) {
        return (
            <div className="bg-background/30 p-8 rounded-2xl backdrop-blur-lg border border-nebula-purple mt-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Collaboration Galaxy</h2>
                <div className="text-pulsar-pink text-center py-8">
                    ⚠️ Error: {error}
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-comet-blue"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background/30 p-8 rounded-2xl backdrop-blur-lg border border-nebula-purple mt-8"
        >
            <h2 className="text-xl font-bold text-foreground mb-6">Collaboration Galaxy</h2>
            <svg ref={svgRef} className="w-full h-96" />
            <div className="flex gap-4 mt-4 text-sm text-foreground/80">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pulsar-pink"></div>
                    Target User
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-comet-blue"></div>
                    Followers
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-nebula-purple"></div>
                    Following
                </div>
            </div>
        </motion.div>
    );
}