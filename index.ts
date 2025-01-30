import Matrix from "./matrix";

const main = () => {
  console.log("Hello World");
  const $inputFile = mustQuerySelector<HTMLInputElement>("#input-file");
  const $buttonRead = mustQuerySelector<HTMLButtonElement>("#button-read");
  const $matrixContainer = mustQuerySelector<HTMLDivElement>("#matrix-container");

  let matrix: Matrix;
  $buttonRead.addEventListener("click", async (e) => {
    const files = $inputFile.files;
    if (!files) {
      return;
    }
    if (files.length === 0) {
      return;
    }
    const csv = await fetchFile(files[0]);
    const data = parseCSVAsNumber(csv);
    matrix = Matrix.fromData(data);
    $matrixContainer.innerHTML = "";
    $matrixContainer.appendChild(matrix.toHTML());
  });
};

const mustQuerySelector = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element as T;
};

const parseCSVAsNumber = (csv: string): number[][] => {
  return csv
    .trim()
    .split("\n")
    .map((line) => line.split(",").map((value) => value.trim()))
    .map((line) =>
      line.map((value) => {
        const number = Number(value);
        if (isNaN(number)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return number;
      })
    );
};

const fetchFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        return;
      }
      const result = e.target.result;
      if (typeof result !== "string") {
        return;
      }
      resolve(result);
    };
    reader.readAsText(file);
  });
};

const displayMatrix = (data: number[][]) => {
  const $container = mustQuerySelector<HTMLDivElement>("#matrix-container");
};

main();
