import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import EpisodesPage from "../../src/pages/EpisodesPage";

// Mock axios
jest.mock("axios");

// Mock CharacterGrid component
jest.mock("../../src/components/HomePage/CharacterGrid", () => {
  return function MockCharacterGrid({ characters }) {
    return (
      <div data-testid="character-grid">
        {characters.map((char) => (
          <div key={char.id} data-testid="character-item">
            {char.name}
          </div>
        ))}
      </div>
    );
  };
});

describe("EpisodesPage", () => {
  const mockEpisodes = {
    info: {
      count: 51,
      pages: 3,
      next: "https://rickandmortyapi.com/api/episode?page=2",
      prev: null,
    },
    results: [
      {
        id: 1,
        name: "Pilot",
        air_date: "December 2, 2013",
        episode: "S01E01",
        characters: [
          "https://rickandmortyapi.com/api/character/1",
          "https://rickandmortyapi.com/api/character/2",
        ],
        url: "https://rickandmortyapi.com/api/episode/1",
        created: "2017-11-10T12:56:33.798Z",
      },
      {
        id: 2,
        name: "Lawnmower Dog",
        air_date: "December 9, 2013",
        episode: "S01E02",
        characters: [
          "https://rickandmortyapi.com/api/character/1",
          "https://rickandmortyapi.com/api/character/2",
        ],
        url: "https://rickandmortyapi.com/api/episode/2",
        created: "2017-11-10T12:56:33.916Z",
      },
    ],
  };

  const mockCharacters = [
    {
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    },
    {
      id: 2,
      name: "Morty Smith",
      status: "Alive",
      species: "Human",
      image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
    },
  ];

  beforeEach(() => {
    axios.get.mockReset();
  });

  test("renders EpisodesPage with loading state", () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves to keep loading

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Loading episodes...")).toBeInTheDocument();
  });

  test("renders episodes when API call is successful", async () => {
    axios.get.mockResolvedValueOnce({ data: mockEpisodes });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Pilot")).toBeInTheDocument();
      expect(screen.getByText("Lawnmower Dog")).toBeInTheDocument();
      expect(screen.getByText("Episode: S01E01")).toBeInTheDocument();
      expect(
        screen.getByText("Air Date: December 2, 2013")
      ).toBeInTheDocument();
    });
  });

  test("handles search functionality", async () => {
    // Initial load
    axios.get.mockResolvedValueOnce({ data: mockEpisodes });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Pilot")).toBeInTheDocument();
    });

    // Search for an episode
    const searchedEpisodes = {
      info: { pages: 1 },
      results: [mockEpisodes.results[0]],
    };

    axios.get.mockResolvedValueOnce({ data: searchedEpisodes });

    const searchInput = screen.getByPlaceholderText("Search episodes...");
    fireEvent.change(searchInput, { target: { value: "Pilot" } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/episode?page=1&name=Pilot"
      );
      expect(screen.getByText("Pilot")).toBeInTheDocument();
      expect(screen.queryByText("Lawnmower Dog")).not.toBeInTheDocument();
    });
  });

  test("shows empty state when no episodes are found", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        info: { pages: 0 },
        results: [],
      },
    });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No episodes found")).toBeInTheDocument();
    });
  });

  test("handles pagination", async () => {
    // Initial load - page 1
    axios.get.mockResolvedValueOnce({ data: mockEpisodes });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    // Click next page
    const page2Episodes = {
      info: {
        count: 51,
        pages: 3,
        next: "https://rickandmortyapi.com/api/episode?page=3",
        prev: "https://rickandmortyapi.com/api/episode?page=1",
      },
      results: [
        {
          id: 21,
          name: "The Wedding Squanchers",
          air_date: "October 4, 2015",
          episode: "S02E10",
          characters: ["https://rickandmortyapi.com/api/character/1"],
        },
      ],
    };

    axios.get.mockResolvedValueOnce({ data: page2Episodes });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/episode?page=2&name="
      );
      expect(screen.getByText("The Wedding Squanchers")).toBeInTheDocument();
      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });

    // Click previous page
    axios.get.mockResolvedValueOnce({ data: mockEpisodes });

    const prevButton = screen.getByText("Previous");
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/episode?page=1&name="
      );
      expect(screen.getByText("Pilot")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });
  });

  test("opens modal with characters when 'View Characters' is clicked", async () => {
    // Initial load
    axios.get.mockResolvedValueOnce({ data: mockEpisodes });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Pilot")).toBeInTheDocument();
    });

    // Mock characters API call
    axios.get.mockResolvedValueOnce({ data: mockCharacters });

    // Click "View Characters" for Pilot episode
    const viewCharactersButtons = screen.getAllByText("View Characters");
    fireEvent.click(viewCharactersButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Characters in Pilot")).toBeInTheDocument();
      expect(screen.getByTestId("character-grid")).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/character/1,2"
      );
    });

    // Close modal by clicking the close button
    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Characters in Pilot")).not.toBeInTheDocument();
    });
  });

  test("handles error when fetching episodes", async () => {
    axios.get.mockRejectedValueOnce(new Error("API error"));

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No episodes found")).toBeInTheDocument();
    });
  });

  test("handles episode with no characters", async () => {
    const episodesWithNoCharacters = {
      info: { pages: 1 },
      results: [
        {
          id: 999,
          name: "Empty Episode",
          air_date: "Never",
          episode: "S00E00",
          characters: [],
        },
      ],
    };

    axios.get.mockResolvedValueOnce({ data: episodesWithNoCharacters });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Empty Episode")).toBeInTheDocument();
      expect(screen.getByText("No Characters")).toBeInTheDocument();
      const noCharactersButton = screen.getByText("No Characters");
      expect(noCharactersButton).toBeDisabled();
    });
  });

  test("handles modal close by clicking backdrop", async () => {
    // Initial load
    axios.get.mockResolvedValueOnce({ data: mockEpisodes });

    render(
      <BrowserRouter>
        <EpisodesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Pilot")).toBeInTheDocument();
    });

    // Mock characters API call
    axios.get.mockResolvedValueOnce({ data: mockCharacters });

    // Click "View Characters" for Pilot episode
    const viewCharactersButtons = screen.getAllByText("View Characters");
    fireEvent.click(viewCharactersButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Characters in Pilot")).toBeInTheDocument();
    });

    // Close modal by clicking the backdrop (modal overlay)
    const modal = screen.getByText("Characters in Pilot").parentElement
      .parentElement;
    fireEvent.click(modal);

    await waitFor(() => {
      expect(screen.queryByText("Characters in Pilot")).not.toBeInTheDocument();
    });
  });
});
