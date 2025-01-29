'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodePulse from './components/CodePulse';
import SkillEcosystem from './components/SkillEcosystem';
import CollaborationGraph from './components/CollaborationGraph';

export default function Home() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [languages, setLanguages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch user data
      const userRes = await fetch(`/api/github?username=${username}`);
      if (!userRes.ok) throw new Error('User not found');
      const user = await userRes.json();
      setUserData(user);

      // Fetch repositories for language data
      const reposRes = await fetch(user.repos_url);
      const repos = await reposRes.json();
      const langStats = repos.reduce((acc, repo) => {
        if (repo.language) {
          const lang = repo.language || 'Other';
          acc[lang] = (acc[lang] || 0) + 1;
        }
        return acc;
      }, {});
      setLanguages(langStats);

    } catch (err) {
      setError(err.message);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter GitHub username..."
              className="flex-1 p-4 rounded-xl bg-background/50 backdrop-blur-lg border border-nebula-purple text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-comet-blue"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-4 bg-nebula-purple rounded-xl text-white font-medium hover:bg-pulsar-pink transition-all duration-300 relative overflow-hidden"
            >
              {isLoading && (
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className="relative z-10">
                {isLoading ? 'Launching Probe...' : 'Explore Universe'}
              </span>
            </button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-pulsar-pink text-sm"
            >
              ⚠️ {error}
            </motion.p>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {isLoading ? (
            <SkeletonLoader />
          ) : userData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Profile Card */}
              <div className="bg-background/30 p-8 rounded-2xl backdrop-blur-lg border border-nebula-purple">
                <div className="flex items-center gap-6">
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    src={userData.avatar_url}
                    alt={userData.login}
                    className="w-24 h-24 rounded-full border-4 border-comet-blue"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      {userData.name || userData.login}
                    </h1>
                    <p className="text-gray-300 mt-2">{userData.bio}</p>
                    <div className="mt-4 flex gap-4 text-sm">
                      <p className="text-comet-blue">
                        🧑💻 Since {new Date(userData.created_at).getFullYear()}
                      </p>
                      {userData.location && (
                        <p className="text-pulsar-pink">📍 {userData.location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mt-8">
                  {[
                    { label: 'Followers', value: userData.followers },
                    { label: 'Following', value: userData.following },
                    { label: 'Repos', value: userData.public_repos },
                    { label: 'Gists', value: userData.public_gists },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-space-black rounded-lg text-center"
                    >
                      <div className="text-2xl font-bold text-comet-blue">
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Visualizations */}
              <CodePulse username={userData.login} />
              <SkillEcosystem languages={languages} />
              <CollaborationGraph username={userData.login} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

const SkeletonLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-8"
  >
    <div className="bg-background/30 p-8 rounded-2xl backdrop-blur-lg border border-nebula-purple">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  </motion.div>
);