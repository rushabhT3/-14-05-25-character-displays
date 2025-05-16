// HomePage.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import HomePage from "../../src/pages/HomePage";

// Mock axios
jest.mock("axios");

describe("HomePage", () => {
  const mockCharactersData = {
    info: { count: 20, pages: 2 },
    results: [
      {
        id: 1,
        name: "Rick Sanchez",
        status: "Alive",
        species: "Human",
        location: { name: "Earth" },
        image: "rick.jpg",
      },
      {
        id: 2,
        name: "Morty Smith",
        status: "Alive",
        species: "Human",
        location: { name: "Earth" },
        image: "morty.jpg",
      },
    ],
  };

  beforeEach(() => {
    // Setup basic mock responses
    axios.get.mockImplementation((url) => {
      // Basic responses for different API endpoints
      if (url.includes("location")) {
        return Promise.resolve({
          data: {
            info: { pages: 1 },
            results: [{ id: 1, name: "Earth", type: "Planet" }],
          },
        });
      } else if (url.includes("episode")) {
        return Promise.resolve({
          data: {
            info: { pages: 1 },
            results: [{ id: 1, name: "Pilot", episode: "S01E01" }],
          },
        });
      } else {
        return Promise.resolve({ data: mockCharactersData });
      }
    });
  });

  test("renders search bar and filters button", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText("Search by name...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Show Filters/i })
    ).toBeInTheDocument();
  });

  test("displays character data after loading", async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Wait for characters to appear
    await waitFor(() => {
      expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
      expect(screen.getByText("Morty Smith")).toBeInTheDocument();
    });
  });

  test("shows and hides filter panel", async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Initially filters should be hidden
    expect(screen.queryByText("All Statuses")).not.toBeInTheDocument();

    // Click to show filters
    fireEvent.click(screen.getByRole("button", { name: /Show Filters/i }));

    // Filter options should appear
    expect(screen.getByText("All Statuses")).toBeInTheDocument();

    // Click to hide filters
    fireEvent.click(screen.getByRole("button", { name: /Hide Filters/i }));

    // Filters should be hidden again
    expect(screen.queryByText("All Statuses")).not.toBeInTheDocument();
  });

  test("pagination navigation works", async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Wait for initial page to load
    await waitFor(() => {
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    // Next page should be clickable
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).not.toBeDisabled();
  });
});
