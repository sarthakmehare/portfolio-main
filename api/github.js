module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GITHUB_USERNAME = 'sarthakmehare';
    const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=30`;

    try {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SarthakPortfolio/1.0',
        };

        // Use a GitHub token if available for higher rate limits (5000/hr vs 60/hr)
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(API_URL, { headers });

        if (!response.ok) {
            const remaining = response.headers.get('x-ratelimit-remaining');
            if (response.status === 403 && remaining === '0') {
                const resetTime = response.headers.get('x-ratelimit-reset');
                return res.status(429).json({
                    error: 'GitHub API rate limit exceeded',
                    resetAt: resetTime ? new Date(parseInt(resetTime) * 1000).toISOString() : null,
                });
            }
            return res.status(response.status).json({ error: `GitHub API error: ${response.status}` });
        }

        const events = await response.json();

        // Filter and transform events server-side to reduce payload
        const MAX_ITEMS = 8;
        const filtered = [];

        for (const e of events) {
            if (filtered.length >= MAX_ITEMS) break;

            let text = '';
            let icon = '';
            let url = '';

            if (e.type === 'PushEvent') {
                const commits = e.payload.commits || [];
                const commitCount = commits.length;
                text = `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${e.repo.name.split('/')[1]}`;
                icon = 'push';
                url = `https://github.com/${e.repo.name}`;
            } else if (e.type === 'PullRequestEvent') {
                const action = e.payload.action || 'opened';
                text = `${action.charAt(0).toUpperCase() + action.slice(1)} PR in ${e.repo.name.split('/')[1]}`;
                icon = 'pr';
                url = e.payload.pull_request?.html_url || `https://github.com/${e.repo.name}/pulls`;
            } else if (e.type === 'IssuesEvent') {
                const action = e.payload.action || 'opened';
                text = `${action.charAt(0).toUpperCase() + action.slice(1)} issue in ${e.repo.name.split('/')[1]}`;
                icon = 'issue';
                url = e.payload.issue?.html_url || `https://github.com/${e.repo.name}/issues`;
            } else if (e.type === 'CreateEvent') {
                const refType = e.payload.ref_type;
                const ref = e.payload.ref;
                text = `Created ${refType}${ref ? ` "${ref}"` : ''} in ${e.repo.name.split('/')[1]}`;
                icon = 'create';
                url = `https://github.com/${e.repo.name}`;
            } else if (e.type === 'WatchEvent') {
                text = `Starred ${e.repo.name.split('/')[1]}`;
                icon = 'star';
                url = `https://github.com/${e.repo.name}`;
            } else if (e.type === 'ForkEvent') {
                text = `Forked ${e.repo.name.split('/')[1]}`;
                icon = 'fork';
                url = `https://github.com/${e.repo.name}`;
            } else if (e.type === 'DeleteEvent') {
                text = `Deleted ${e.payload.ref_type} in ${e.repo.name.split('/')[1]}`;
                icon = 'delete';
                url = `https://github.com/${e.repo.name}`;
            } else {
                continue;
            }

            filtered.push({
                text,
                icon,
                url,
                repo: e.repo.name,
                date: e.created_at,
            });
        }

        // Cache for 5 minutes
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json({ events: filtered });

    } catch (err) {
        console.error('GitHub API fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch GitHub activity' });
    }
};
