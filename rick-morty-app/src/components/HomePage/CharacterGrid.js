// src/components/HomePage/CharacterGrid.js
import React from "react";
import { Link } from "react-router-dom";
import styles from "../../pages/HomePage.module.css";

export default function CharacterGrid({ characters, locations, episodes }) {
  return (
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
  );
}
