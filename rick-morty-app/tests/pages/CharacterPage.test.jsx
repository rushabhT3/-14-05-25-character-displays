import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import CharacterPage from "../../src/pages/CharacterPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("axios");

const mockCharacter = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  image: "rick.jpg",
  origin: { name: "Earth", url: "https://rickandmortyapi.com/api/location/1" },
  location: {
    name: "Citadel of Ricks",
    url: "https://rickandmortyapi.com/api/location/3",
  },
  episode: ["https://rickandmortyapi.com/api/episode/1"],
};

const mockLocation = {
  id: 1,
  name: "Earth",
  type: "Planet",
  dimension: "Dimension C-137",
  residents: ["https://rickandmortyapi.com/api/character/1"],
};

const mockEpisode = {
  id: 1,
  name: "Pilot",
  episode: "S01E01",
  air_date: "December 2, 2013",
};

describe("CharacterPage", () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes("character/1"))
        return Promise.resolve({ data: mockCharacter });
      if (url.includes("location/1"))
        return Promise.resolve({ data: mockLocation });
      if (url.includes("episode/1"))
        return Promise.resolve({ data: mockEpisode });
      return Promise.reject(new Error("Not found"));
    });
  });

  test("renders loading state initially", async () => {
    render(
      <MemoryRouter initialEntries={["/character/1"]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays character details after loading", async () => {
    render(
      <MemoryRouter initialEntries={["/character/1"]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
      expect(screen.getByText("Status: Alive")).toBeInTheDocument();
      expect(screen.getByText("Species: Human")).toBeInTheDocument();
    });
  });

  test("displays origin and location details", async () => {
    render(
      <MemoryRouter initialEntries={["/character/1"]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Dimension: Dimension C-137")
      ).toBeInTheDocument();
      expect(screen.getByText("Residents: 1")).toBeInTheDocument();
    });
  });

  test("displays episodes correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/character/1"]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Featured Episodes (1)")).toBeInTheDocument();
      expect(screen.getByText("S01E01")).toBeInTheDocument();
      expect(
        screen.getByText("Air Date: December 2, 2013")
      ).toBeInTheDocument();
    });
  });

  test("handles error state", async () => {
    axios.get.mockRejectedValue(new Error("API error"));

    render(
      <MemoryRouter initialEntries={["/character/999"]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to load character data. Please try again later."
        )
      ).toBeInTheDocument();
    });
  });
});
