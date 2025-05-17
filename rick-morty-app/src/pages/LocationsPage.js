import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./LocationsPage.module.css";
import CharacterGrid from "../components/HomePage/CharacterGrid";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://rickandmortyapi.com/api/location?page=${page}&name=${searchTerm}`
        );
        setLocations(response.data.results || []);
        setTotalPages(response.data.info?.pages || 1);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [page, searchTerm]);

  const fetchResidents = async (residentUrls) => {
    try {
      if (!residentUrls || residentUrls.length === 0) {
        setResidents([]);
        return;
      }

      const response = await axios.get(
        `https://rickandmortyapi.com/api/character/${residentUrls.map((url) =>
          url.split("/").pop()
        )}`
      );
      setResidents(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      console.error("Error fetching residents:", error);
      setResidents([]);
    }
  };

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedLocation(null);
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
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading locations...</div>
      ) : (
        <>
          <div className={styles.grid}>
            {locations.map((location) => (
              <div key={location.id} className={styles.card}>
                <h3>{location.name || "Unknown Location"}</h3>
                <p>Type: {location.type || "N/A"}</p>
                <p>Dimension: {location.dimension || "Unknown"}</p>
                <p>Residents: {location.residents?.length || 0}</p>
                <button
                  onClick={() => {
                    setSelectedLocation(location);
                    fetchResidents(location.residents);
                  }}
                  className={styles.viewButton}
                  disabled={!location.residents?.length}
                >
                  {location.residents?.length
                    ? "View Residents"
                    : "No Residents"}
                </button>
              </div>
            ))}
          </div>

          {locations.length === 0 && !loading && (
            <div className={styles.emptyState}>No locations found</div>
          )}
        </>
      )}

      {selectedLocation && (
        <div className={styles.modal} onClick={handleModalClose}>
          <div className={styles.modalContent}>
            <h2>Residents of {selectedLocation.name}</h2>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedLocation(null)}
            >
              ×
            </button>
            {residents.length > 0 ? (
              <CharacterGrid characters={residents} />
            ) : (
              <div className={styles.emptyState}>
                No residents found in this location
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
