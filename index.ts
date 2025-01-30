import { $ } from "bun";
import Matrix from "./matrix";

const main = () => {
  console.log("Hello World");
  const $inputFile = mustQuerySelector<HTMLInputElement>("#input-file");
  const $buttonRead = mustQuerySelector<HTMLButtonElement>("#button-read");
  const $buttonRowScaling = mustQuerySelector<HTMLButtonElement>("#button-row-scaling");
  const $buttonColScaling = mustQuerySelector<HTMLButtonElement>("#button-col-scaling");
  const $buttonAutoScaling = mustQuerySelector<HTMLButtonElement>("#button-auto");
  const $buttonStop = mustQuerySelector<HTMLButtonElement>("#button-stop");
  const $buttonReset = mustQuerySelector<HTMLButtonElement>("#button-reset");

  // ファイル読み込み
  let matrix: Matrix | null = null;
  let data: number[][] = [];
  $buttonRead.addEventListener("click", async (e) => {
    const files = $inputFile.files;
    if (!files) {
      return;
    }
    if (files.length === 0) {
      return;
    }
    const csv = await fetchFile(files[0]);
    data = parseCSVAsNumber(csv);
    matrix = Matrix.fromData(data);
    displayMatrix(matrix);
  });

  // 行スケーリング
  $buttonRowScaling.addEventListener("click", () => {
    if (!matrix) {
      return;
    }
    matrix.rowScaling();
    displayMatrix(matrix);
  });

  // 列スケーリング
  $buttonColScaling.addEventListener("click", () => {
    if (!matrix) {
      return;
    }
    matrix.colScaling();
    displayMatrix(matrix);
  });

  // 自動スケーリング
  let abortController: AbortController | null = null;
  $buttonAutoScaling.addEventListener("click", async () => {
    if (!matrix) {
      return;
    }
    abortController = new AbortController();

    $buttonAutoScaling.disabled = true;
    $buttonRowScaling.disabled = true;
    $buttonColScaling.disabled = true;
    $buttonReset.disabled = true;

    while (!matrix.isScaled(1e-6)) {
      matrix.rowScaling();
      displayMatrix(matrix);
      if (!(await sleep(500, abortController))) {
        break;
      }
      matrix.colScaling();
      displayMatrix(matrix);
      if (!(await sleep(500, abortController))) {
        break;
      }
    }

    $buttonAutoScaling.disabled = false;
    $buttonRowScaling.disabled = false;
    $buttonColScaling.disabled = false;
    $buttonReset.disabled = false;
  });

  // 停止
  $buttonStop.addEventListener("click", () => {
    if (abortController) {
      abortController.abort();
    }
    abortController = null;

    $buttonAutoScaling.disabled = false;
    $buttonRowScaling.disabled = false;
    $buttonColScaling.disabled = false;
    $buttonReset.disabled = false;
  });

  // リセット
  $buttonReset.addEventListener("click", () => {
    if (!matrix) {
      return;
    }
    matrix = Matrix.fromData(data);
    displayMatrix(matrix);
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

const displayMatrix = (matrix: Matrix) => {
  const $matrixContainer = mustQuerySelector<HTMLDivElement>("#matrix-container");
  $matrixContainer.innerHTML = "";
  $matrixContainer.appendChild(matrix.toHTML(8));
};

/**
 * sleep は指定した時間だけ待機する
 *
 * signal を渡すことで待機を中断できる. 中断された場合は false を返す
 * @param ms 待機時間 (ミリ秒)
 * @param signal 中断信号
 * @returns true: 正常に待機が終了した, false: 待機が中断された
 */
const sleep = async (ms: number, signal?: AbortController): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeoutID = setTimeout(() => {
      resolve(true);
    }, ms);
    if (signal) {
      signal.signal.addEventListener("abort", () => {
        clearTimeout(timeoutID);
        resolve(false);
      });
    }
  });
};

main();
