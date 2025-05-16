// src/components/HomePage/FilterPanel.js
import React from "react";
import styles from "../../pages/HomePage.module.css";

export default function FilterPanel({
  filters,
  locations,
  episodes,
  onFilterChange,
  onReset,
}) {
  return (
    <div className={styles.filterPanel}>
      <select name="status" value={filters.status} onChange={onFilterChange}>
        <option value="">All Statuses</option>
        <option value="alive">Alive</option>
        <option value="dead">Dead</option>
        <option value="unknown">Unknown</option>
      </select>

      <select name="gender" value={filters.gender} onChange={onFilterChange}>
        <option value="">All Genders</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="genderless">Genderless</option>
        <option value="unknown">Unknown</option>
      </select>

      <select
        name="location"
        value={filters.location}
        onChange={onFilterChange}
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
        onChange={onFilterChange}
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
        onChange={onFilterChange}
      />

      <input
        type="text"
        placeholder="Type"
        name="type"
        value={filters.type}
        onChange={onFilterChange}
      />

      <button onClick={onReset}>Reset Filters</button>
    </div>
  );
}
