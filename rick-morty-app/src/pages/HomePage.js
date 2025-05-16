import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./HomePage.module.css";
import CharacterGrid from "../components/HomePage/CharacterGrid";
import PaginationControls from "../components/HomePage/PaginationControls";
import FilterPanel from "../components/HomePage/FilterPanel";
import useFilterData from "../hooks/useFilterData";
import useFilters from "../hooks/useFilters";

export default function HomePage() {
  // Use custom hooks
  const { locations, episodes } = useFilterData();
  const {
    filters,
    showFilters,
    handleFilterChange,
    resetFilters,
    setShowFilters,
  } = useFilters();

  const [characters, setCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Character fetching useEffect
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

              // Find characters that exist in both filters
              const currentIds = url.split("/").pop().split(",");
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
            Object.entries(params).filter(([, v]) => v) // destructuring like _, v
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

  // Modified handler to include page reset
  const handleFilterChangeWithReset = (e) => {
    handleFilterChange(e);
    setPage(1);
  };

  // Modified reset to include page reset
  const handleResetFilters = () => {
    resetFilters();
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
          onChange={handleFilterChangeWithReset}
        />
        <button onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          locations={locations}
          episodes={episodes}
          onFilterChange={handleFilterChangeWithReset}
          onReset={handleResetFilters}
        />
      )}

      <CharacterGrid
        characters={characters}
        locations={locations}
        episodes={episodes}
      />

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
