import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Repo } from './types/Repo';
import { Commit } from './types/Commit';
import axios from 'axios';
import { Table } from 'antd';
import 'antd/dist/antd.css';
import * as R from 'ramda';
import { Modal, Button } from 'antd';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { ColumnsType } from 'antd/lib/table';
import { Spin } from 'antd';

const STYLED_DIV = styled.div`
   {
    display: flex;
  }
`;

export function App() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [commit, setCommit] = useState<Commit | undefined>();
  const [readme, setReadme] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const languages = useMemo(() => R.uniq(R.pluck('language', repos)), [repos]);

  const showModal = useCallback(async (repoName: string) => {
    setIsModalVisible(true);
    setLoading(true);
    const [commitData, readmeData] = await Promise.allSettled([
      axios.get<Commit>(
        `https://api.github.com/repos/${repoName}/commits?per_page=1`
      ),
      axios.get<any>(
        `https://raw.githubusercontent.com/${repoName}/master/README.md`
      ),
    ]);
    setCommit(R.pathOr([], ['value', 'data'], commitData)[0]);
    setReadme(R.pathOr([], ['value', 'data'], readmeData));
    setLoading(false);
  }, []);

  const handleOk = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const columns: ColumnsType<Repo> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render(repoName: string, record: Repo) {
          return (
            <Button onClick={() => showModal(record.full_name)}>
              {repoName}
            </Button>
          );
        },
      },
      {
        title: 'Description',
        dataIndex: 'description',
      },
      {
        title: 'Language',
        dataIndex: 'language',
        filters: languages.map((language) => ({
          text: language,
          value: language,
        })),
        onFilter: (value: string | number | boolean, record: Repo) =>
          record.language === value,
      },
      {
        title: 'Forks count',
        dataIndex: 'forks_count',
      },
    ],
    [languages, showModal]
  );

  const fetchRepos = useCallback(async () => {
    try {
      const { data } = await axios.get<Repo[]>('http://localhost:4000/repos');
      setRepos(
        data.sort(
          (repoA, repoB) =>
            new Date(repoB.created_at).getTime() -
            new Date(repoA.created_at).getTime()
        )
      );
    } catch (err) {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <>
      <Modal
        title="Repo"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {loading ? (
          <Spin />
        ) : (
          <>
            <h2>Most Recent Commit: </h2>
            <STYLED_DIV>
              <span>Date:</span>
              <span>{commit?.commit.author.date}</span>
            </STYLED_DIV>
            <STYLED_DIV>
              <span>Author:</span>
              <span>{commit?.commit.author.name}</span>
            </STYLED_DIV>
            <STYLED_DIV>
              <span>Message:</span>
              <span>{commit?.commit.message}</span>
            </STYLED_DIV>
            {readme && <ReactMarkdown children={readme} />}
          </>
        )}
      </Modal>
      <Table rowKey={'id'} columns={columns} dataSource={repos} />
      {error && <h1>An error has occured on the Server Side!</h1>}
    </>
  );
}
