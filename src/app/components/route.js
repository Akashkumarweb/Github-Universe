import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    try {
        const [followersRes, followingRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}/followers`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            }),
            fetch(`https://api.github.com/users/${username}/following`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            })
        ]);

        // Handle API errors
        if (followersRes.status === 404 || followingRes.status === 404) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!followersRes.ok || !followingRes.ok) {
            throw new Error('Failed to fetch connections');
        }

        const [followers, following] = await Promise.all([
            followersRes.json(),
            followingRes.json()
        ]);

        const connections = {
            nodes: [
                { id: username, type: 'main' },
                ...followers.map(f => ({ id: f.login, type: 'follower' })),
                ...following.map(f => ({ id: f.login, type: 'following' }))
            ],
            links: [
                ...followers.map(f => ({ source: f.login, target: username })),
                ...following.map(f => ({ source: username, target: f.login }))
            ]
        };

        return NextResponse.json(connections);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch connections' },
            { status: 500 }
        );
    }
}
