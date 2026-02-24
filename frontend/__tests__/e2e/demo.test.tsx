import { render, screen } from "@testing-library/react";

function DemoComponent() {
  return <div>hello</div>;
}

describe("sum", () => {
  it("prints out hello", () => {
    render(<DemoComponent />);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
