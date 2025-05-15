import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./CharacterPage.module.css";

export default function CharacterPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [location, setLocation] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch character data
        const charResponse = await axios.get(
          `https://rickandmortyapi.com/api/character/${id}`
        );
        setCharacter(charResponse.data);

        // Handle origin and location separately instead of in an array
        // This ensures we correctly assign each response to the right state
        try {
          if (charResponse.data.origin && charResponse.data.origin.url) {
            const originResponse = await axios.get(
              charResponse.data.origin.url
            );
            setOrigin(originResponse.data);
          }
        } catch (originError) {
          console.error("Error fetching origin:", originError);
          // Don't set the main error state, just log it
        }

        try {
          if (charResponse.data.location && charResponse.data.location.url) {
            const locationResponse = await axios.get(
              charResponse.data.location.url
            );
            setLocation(locationResponse.data);
          }
        } catch (locationError) {
          console.error("Error fetching location:", locationError);
          // Don't set the main error state, just log it
        }

        // Handle episodes - could be one or many
        const episodeIds = charResponse.data.episode
          .map((url) => url.split("/").pop())
          .join(",");

        if (episodeIds) {
          try {
            const episodesRes = await axios.get(
              `https://rickandmortyapi.com/api/episode/${episodeIds}`
            );
            setEpisodes(
              Array.isArray(episodesRes.data)
                ? episodesRes.data
                : [episodesRes.data]
            );
          } catch (episodeError) {
            console.error("Error fetching episodes:", episodeError);
            setEpisodes([]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading character details:", error);
        setError("Failed to load character data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!character)
    return <div className={styles.error}>Character not found</div>;

  return (
    <div className={styles.container}>
      <img
        src={character.image}
        alt={character.name}
        className={styles.image}
      />
      <h1>{character.name}</h1>

      <div className={styles.details}>
        <div className={styles.section}>
          <h2>Character Info</h2>
          <p>Status: {character.status}</p>
          <p>Species: {character.species}</p>
          <p>Gender: {character.gender}</p>
          <p>Type: {character.type || "N/A"}</p>
        </div>

        <div className={styles.section}>
          <h2>Origin Details</h2>
          <p>Name: {character.origin?.name || "Unknown"}</p>
          {origin ? (
            <>
              <p>Type: {origin.type || "Unknown"}</p>
              <p>Dimension: {origin.dimension || "Unknown"}</p>
              <p>Residents: {origin.residents?.length || 0}</p>
            </>
          ) : (
            character.origin?.url && <p>Additional details not available</p>
          )}
        </div>

        <div className={styles.section}>
          <h2>Current Location</h2>
          <p>Name: {character.location?.name || "Unknown"}</p>
          {location ? (
            <>
              <p>Type: {location.type || "Unknown"}</p>
              <p>Dimension: {location.dimension || "Unknown"}</p>
              <p>Residents: {location.residents?.length || 0}</p>
            </>
          ) : (
            character.location?.url && <p>Additional details not available</p>
          )}
        </div>

        <div className={styles.section}>
          <h2>Featured Episodes ({episodes.length})</h2>
          {episodes.length > 0 ? (
            <div className={styles.episodes}>
              {episodes.map((episode) => (
                <div key={episode.id} className={styles.episodeCard}>
                  <h3>{episode.episode}</h3>
                  <p>{episode.name}</p>
                  <p>Air Date: {episode.air_date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No episode information available</p>
          )}
        </div>
      </div>
    </div>
  );
}
