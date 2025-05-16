// App.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "./App";

describe("App", () => {
  test("renders homepage with search and filters", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <App />,
          // Add this children property to handle nested routes
          children: [
            {
              path: "",
              element: <App />,
            },
            {
              path: "character/:id",
              element: <App />,
            },
          ],
        },
      ],
      {
        initialEntries: ["/"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByPlaceholderText("Search by name...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Show Filters/i })
    ).toBeInTheDocument();
  });

  test("renders character page route", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <App />,
          children: [
            {
              path: "character/:id",
              element: <App />,
            },
          ],
        },
      ],
      {
        initialEntries: ["/character/1"],
      }
    );

    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });
});
