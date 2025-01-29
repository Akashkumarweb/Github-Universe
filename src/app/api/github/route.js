import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Validate username
    if (!username) {
        return NextResponse.json(
            { error: 'Username parameter is required' },
            { status: 400 }
        );
    }

    try {
        const headers = {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json'
        };

        // Fetch both endpoints simultaneously
        const [followersRes, followingRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}/followers?per_page=100`, { headers }),
            fetch(`https://api.github.com/users/${username}/following?per_page=100`, { headers })
        ]);

        // Handle GitHub API errors
        if (followersRes.status === 404 || followingRes.status === 404) {
            return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
        }

        if (followersRes.status === 403) {
            return NextResponse.json(
                { error: 'API rate limit exceeded' },
                { status: 429 }
            );
        }

        // Verify content type before parsing
        const contentType = followersRes.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            throw new Error('Received non-JSON response from GitHub API');
        }

        const [followers, following] = await Promise.all([
            followersRes.json(),
            followingRes.json()
        ]);

        return NextResponse.json({
            nodes: [
                { id: username, type: 'main' },
                ...followers.map(f => ({ id: f.login, type: 'follower' })),
                ...following.map(f => ({ id: f.login, type: 'following' }))
            ],
            links: [
                ...followers.map(f => ({ source: f.login, target: username })),
                ...following.map(f => ({ source: username, target: f.login }))
            ]
        });

    } catch (error) {
        console.error('GitHub API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch connections' },
            { status: 500 }
        );
    }
}