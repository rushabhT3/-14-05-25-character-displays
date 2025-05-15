import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [characters, setCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locations, setLocations] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    species: "",
    type: "",
    gender: "",
    location: "",
    episode: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAllPages = async (url) => {
      let allResults = [];
      let nextPage = url;

      while (nextPage) {
        const response = await axios.get(nextPage);
        allResults = [...allResults, ...response.data.results];
        nextPage = response.data.info.next;
      }

      return allResults;
    };

    const fetchFilterData = async () => {
      try {
        // Show loading state
        setLocations([{ id: "loading", name: "Loading locations..." }]);
        setEpisodes([{ id: "loading", name: "Loading episodes..." }]);

        // Fetch all pages of location and episode data in parallel
        const [allLocations, allEpisodes] = await Promise.all([
          fetchAllPages("https://rickandmortyapi.com/api/location"),
          fetchAllPages("https://rickandmortyapi.com/api/episode"),
        ]);

        setLocations(allLocations);
        setEpisodes(allEpisodes);
      } catch (error) {
        console.error("Error loading filter data:", error);
        setLocations([]);
        setEpisodes([]);
      }
    };

    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // These are the parameters the API actually supports as direct filters
        const params = {
          name: filters.name,
          status: filters.status,
          species: filters.species,
          type: filters.type,
          gender: filters.gender,
          page,
        };

        // Start with a base request to get characters
        let url = "https://rickandmortyapi.com/api/character/";

        // If location filter is active, we need to get characters from that location first
        if (filters.location) {
          const location = locations.find((l) => l.name === filters.location);
          if (location) {
            // Get all residents of this location
            const locationResponse = await axios.get(
              `https://rickandmortyapi.com/api/location/${location.id}`
            );
            const characterUrls = locationResponse.data.residents;

            if (characterUrls.length === 0) {
              setCharacters([]);
              setTotalPages(0);
              return;
            }

            // Extract the character IDs from the URLs
            const characterIds = characterUrls.map((url) =>
              url.split("/").pop()
            );

            // Add location characters as a filter to the existing query
            url = `https://rickandmortyapi.com/api/character/${characterIds.join(
              ","
            )}`;

            // We'll handle pagination ourselves for this case
            delete params.page;
          }
        }

        // If episode filter is active, we need to get characters from that episode first
        if (filters.episode) {
          const episode = episodes.find((e) => e.episode === filters.episode);
          if (episode) {
            // Get all characters in this episode
            const episodeResponse = await axios.get(
              `https://rickandmortyapi.com/api/episode/${episode.id}`
            );
            const characterUrls = episodeResponse.data.characters;

            if (characterUrls.length === 0) {
              setCharacters([]);
              setTotalPages(0);
              return;
            }

            // Extract the character IDs from the URLs
            const characterIds = characterUrls.map((url) =>
              url.split("/").pop()
            );

            // If we already filtered by location, we need to find the intersection
            if (filters.location) {
              // Get the current filtered IDs from the URL
              const currentIds = url.split("/").pop().split(",");

              // Find characters that exist in both filters
              const intersectionIds = characterIds.filter((id) =>
                currentIds.includes(id)
              );

              if (intersectionIds.length === 0) {
                setCharacters([]);
                setTotalPages(0);
                return;
              }

              url = `https://rickandmortyapi.com/api/character/${intersectionIds.join(
                ","
              )}`;
            } else {
              // Just use the episode characters
              url = `https://rickandmortyapi.com/api/character/${characterIds.join(
                ","
              )}`;
            }

            // We'll handle pagination ourselves for this case
            delete params.page;
          }
        }

        // Make the API request with the constructed URL and parameters
        const response = await axios.get(url, {
          params: Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v)
          ),
        });

        // Handle the case where we get a collection of characters (not paginated)
        let results;
        if (Array.isArray(response.data)) {
          results = response.data;

          // Apply the remaining filters manually
          if (filters.name) {
            results = results.filter((char) =>
              char.name.toLowerCase().includes(filters.name.toLowerCase())
            );
          }
          if (filters.status) {
            results = results.filter(
              (char) =>
                char.status.toLowerCase() === filters.status.toLowerCase()
            );
          }
          if (filters.species) {
            results = results.filter((char) =>
              char.species.toLowerCase().includes(filters.species.toLowerCase())
            );
          }
          if (filters.type) {
            results = results.filter((char) =>
              char.type.toLowerCase().includes(filters.type.toLowerCase())
            );
          }
          if (filters.gender) {
            results = results.filter(
              (char) =>
                char.gender.toLowerCase() === filters.gender.toLowerCase()
            );
          }

          // Manual pagination
          const pageSize = 20;
          const totalPages = Math.ceil(results.length / pageSize);
          const start = (page - 1) * pageSize;
          const end = start + pageSize;

          setCharacters(results.slice(start, end));
          setTotalPages(totalPages);
        } else {
          // Standard paginated response
          setCharacters(response.data.results);
          setTotalPages(response.data.info.pages);
        }
      } catch (error) {
        console.log("No characters found", error);
        setCharacters([]);
        setTotalPages(0);
      }
    };
    fetchCharacters();
  }, [page, filters, locations, episodes]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      status: "",
      species: "",
      type: "",
      gender: "",
      location: "",
      episode: "",
    });
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name..."
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <button onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
          >
            <option value="">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            disabled={locations.length === 1 && locations[0].id === "loading"}
          >
            <option value="">All Locations</option>
            {locations.length > 0 && locations[0].id !== "loading" ? (
              locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name} ({location.type})
                </option>
              ))
            ) : (
              <option value="">Loading locations...</option>
            )}
          </select>

          <select
            name="episode"
            value={filters.episode}
            onChange={handleFilterChange}
            disabled={episodes.length === 1 && episodes[0].id === "loading"}
          >
            <option value="">All Episodes</option>
            {episodes.length > 0 && episodes[0].id !== "loading" ? (
              episodes.map((episode) => (
                <option key={episode.id} value={episode.episode}>
                  {episode.episode} - {episode.name}
                </option>
              ))
            ) : (
              <option value="">Loading episodes...</option>
            )}
          </select>

          <input
            type="text"
            placeholder="Species"
            name="species"
            value={filters.species}
            onChange={handleFilterChange}
          />

          <input
            type="text"
            placeholder="Type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          />

          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      )}

      <div className={styles.grid}>
        {characters.length > 0 ? (
          characters.map((char) => (
            <Link
              to={`/character/${char.id}`}
              key={char.id}
              className={styles.card}
            >
              <img src={char.image} alt={char.name} />
              <h3>{char.name}</h3>
              <p>
                {char.species} ({char.status})
              </p>
              <p>📍 {char.location.name}</p>
            </Link>
          ))
        ) : (
          <div className={styles.noResults}>
            {(locations.length === 1 && locations[0].id === "loading") ||
            (episodes.length === 1 && episodes[0].id === "loading")
              ? "Loading filter data..."
              : "No characters found matching your criteria"}
          </div>
        )}
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
