// hooks/useFilterData.js
import { useState, useEffect } from "react";
import axios from "axios";

const useFilterData = () => {
  const [locations, setLocations] = useState([]);
  const [episodes, setEpisodes] = useState([]);

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

    const fetchData = async () => {
      try {
        setLocations([{ id: "loading", name: "Loading locations..." }]);
        setEpisodes([{ id: "loading", name: "Loading episodes..." }]);

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

    fetchData();
  }, []);

  return { locations, episodes };
};

export default useFilterData;
