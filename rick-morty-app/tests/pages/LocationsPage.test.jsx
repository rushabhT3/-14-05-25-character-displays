import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import LocationsPage from "../../src/pages/LocationsPage";

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

describe("LocationsPage", () => {
  const mockLocations = {
    info: {
      count: 108,
      pages: 6,
      next: "https://rickandmortyapi.com/api/location?page=2",
      prev: null,
    },
    results: [
      {
        id: 1,
        name: "Earth (C-137)",
        type: "Planet",
        dimension: "Dimension C-137",
        residents: [
          "https://rickandmortyapi.com/api/character/38",
          "https://rickandmortyapi.com/api/character/45",
        ],
        url: "https://rickandmortyapi.com/api/location/1",
        created: "2017-11-10T12:42:04.162Z",
      },
      {
        id: 2,
        name: "Abadango",
        type: "Cluster",
        dimension: "unknown",
        residents: ["https://rickandmortyapi.com/api/character/6"],
        url: "https://rickandmortyapi.com/api/location/2",
        created: "2017-11-10T13:06:38.182Z",
      },
    ],
  };

  const mockResidents = [
    {
      id: 38,
      name: "Beth Smith",
      status: "Alive",
      species: "Human",
      image: "https://rickandmortyapi.com/api/character/avatar/38.jpeg",
    },
    {
      id: 45,
      name: "Jerry Smith",
      status: "Alive",
      species: "Human",
      image: "https://rickandmortyapi.com/api/character/avatar/45.jpeg",
    },
  ];

  beforeEach(() => {
    axios.get.mockReset();
  });

  test("renders LocationsPage with loading state", () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves to keep loading

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Loading locations...")).toBeInTheDocument();
  });

  test("renders locations when API call is successful", async () => {
    axios.get.mockResolvedValueOnce({ data: mockLocations });

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
      expect(screen.getByText("Abadango")).toBeInTheDocument();
      expect(screen.getByText("Type: Planet")).toBeInTheDocument();
      expect(
        screen.getByText("Dimension: Dimension C-137")
      ).toBeInTheDocument();
      expect(screen.getByText("Residents: 2")).toBeInTheDocument();
    });
  });

  test("handles search functionality", async () => {
    // Initial load
    axios.get.mockResolvedValueOnce({ data: mockLocations });

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
    });

    // Search for a location
    const searchedLocations = {
      info: { pages: 1 },
      results: [mockLocations.results[0]],
    };

    axios.get.mockResolvedValueOnce({ data: searchedLocations });

    const searchInput = screen.getByPlaceholderText("Search locations...");
    fireEvent.change(searchInput, { target: { value: "Earth" } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/location?page=1&name=Earth"
      );
      expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
      expect(screen.queryByText("Abadango")).not.toBeInTheDocument();
    });
  });

  test("shows empty state when no locations are found", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        info: { pages: 0 },
        results: [],
      },
    });

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No locations found")).toBeInTheDocument();
    });
  });

  test("handles pagination", async () => {
    // Initial load - page 1
    axios.get.mockResolvedValueOnce({ data: mockLocations });

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Page 1 of 6")).toBeInTheDocument();
    });

    // Click next page
    const page2Locations = {
      info: {
        count: 108,
        pages: 6,
        next: "https://rickandmortyapi.com/api/location?page=3",
        prev: "https://rickandmortyapi.com/api/location?page=1",
      },
      results: [
        {
          id: 3,
          name: "Citadel of Ricks",
          type: "Space station",
          dimension: "unknown",
          residents: ["https://rickandmortyapi.com/api/character/8"],
        },
      ],
    };

    axios.get.mockResolvedValueOnce({ data: page2Locations });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/location?page=2&name="
      );
      expect(screen.getByText("Citadel of Ricks")).toBeInTheDocument();
      expect(screen.getByText("Page 2 of 6")).toBeInTheDocument();
    });

    // Click previous page
    axios.get.mockResolvedValueOnce({ data: mockLocations });

    const prevButton = screen.getByText("Previous");
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/location?page=1&name="
      );
      expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 6")).toBeInTheDocument();
    });
  });

  test("opens modal with residents when 'View Residents' is clicked", async () => {
    // Initial load
    axios.get.mockResolvedValueOnce({ data: mockLocations });

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
    });

    // Mock residents API call
    axios.get.mockResolvedValueOnce({ data: mockResidents });

    // Click "View Residents" for Earth
    const viewResidentsButtons = screen.getAllByText("View Residents");
    fireEvent.click(viewResidentsButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Residents of Earth (C-137)")
      ).toBeInTheDocument();
      expect(screen.getByTestId("character-grid")).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith(
        "https://rickandmortyapi.com/api/character/38,45"
      );
    });

    // Close modal by clicking the close button
    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Residents of Earth (C-137)")
      ).not.toBeInTheDocument();
    });
  });

  test("handles error when fetching locations", async () => {
    axios.get.mockRejectedValueOnce(new Error("API error"));

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No locations found")).toBeInTheDocument();
    });
  });

  test("handles location with no residents", async () => {
    const locationsWithNoResidents = {
      info: { pages: 1 },
      results: [
        {
          id: 5,
          name: "Anatomy Park",
          type: "Microverse",
          dimension: "Dimension C-137",
          residents: [],
        },
      ],
    };

    axios.get.mockResolvedValueOnce({ data: locationsWithNoResidents });

    render(
      <BrowserRouter>
        <LocationsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Anatomy Park")).toBeInTheDocument();
      expect(screen.getByText("No Residents")).toBeInTheDocument();
      const noResidentsButton = screen.getByText("No Residents");
      expect(noResidentsButton).toBeDisabled();
    });
  });
});
