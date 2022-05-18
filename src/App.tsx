import React, { useState, useEffect, useCallback } from 'react';
import { Repo } from './types/Repo';
import axios from 'axios';

const client = axios.create({ baseURL: process.env.API_BASE_URL });

export function App() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<boolean>(false);

  const fetchRepos = useCallback(async () => {
    const { data } = await client.get<Repo[]>('/repos');

    setRepos(data);
  }, []);

  useEffect(() => {
    try {
      fetchRepos();
    } catch (err) {
      setError(true);
    }
  }, [fetchRepos]);

  return (
    <div className="container">
     
    </div>
  );
}
