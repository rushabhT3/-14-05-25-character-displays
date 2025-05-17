import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./EpisodesPage.module.css";
import CharacterGrid from "../components/HomePage/CharacterGrid";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://rickandmortyapi.com/api/episode?page=${page}&name=${searchTerm}`
        );
        setEpisodes(response.data.results || []);
        setTotalPages(response.data.info?.pages || 1);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setEpisodes([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, [page, searchTerm]);

  const fetchCharacters = async (characterUrls) => {
    try {
      if (!characterUrls || characterUrls.length === 0) {
        setCharacters([]);
        return;
      }

      const response = await axios.get(
        `https://rickandmortyapi.com/api/character/${characterUrls.map((url) =>
          url.split("/").pop()
        )}`
      );
      setCharacters(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      console.error("Error fetching characters:", error);
      setCharacters([]);
    }
  };

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedEpisode(null);
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← Back to Characters
      </Link>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading episodes...</div>
      ) : (
        <>
          <div className={styles.grid}>
            {episodes.map((episode) => (
              <div key={episode.id} className={styles.card}>
                <h3>{episode.name || "Unknown Episode"}</h3>
                <p>Episode: {episode.episode || "N/A"}</p>
                <p>Air Date: {episode.air_date || "Unknown"}</p>
                <button
                  onClick={() => {
                    setSelectedEpisode(episode);
                    fetchCharacters(episode.characters);
                  }}
                  className={styles.viewButton}
                  disabled={!episode.characters?.length}
                >
                  {episode.characters?.length
                    ? "View Characters"
                    : "No Characters"}
                </button>
              </div>
            ))}
          </div>

          {episodes.length === 0 && !loading && (
            <div className={styles.emptyState}>No episodes found</div>
          )}
        </>
      )}

      {selectedEpisode && (
        <div className={styles.modal} onClick={handleModalClose}>
          <div className={styles.modalContent}>
            <h2>Characters in {selectedEpisode.name}</h2>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedEpisode(null)}
            >
              ×
            </button>
            {characters.length > 0 ? (
              <CharacterGrid characters={characters} />
            ) : (
              <div className={styles.emptyState}>
                No characters found in this episode
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.pagination}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
