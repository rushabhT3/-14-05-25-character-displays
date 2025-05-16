// hooks/useFilters.js
import { useState } from "react";

const useFilters = () => {
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

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
  };

  return {
    filters,
    showFilters,
    handleFilterChange,
    resetFilters,
    setShowFilters,
  };
};

export default useFilters;
