import { fetchFile, parseCSVAsNumber } from "./csv";
import Matrix from "./matrix";

const MAX_DURATION = 1100;
const MIN_DURATION = 100;
const DEFAULT_PRECISION = 5;
const DEFAULT_DURATION = 500;
const DEFAULT_ERROR = 1e-6;

const main = () => {
  console.log("Hello World");
  const $inputFile = mustQuerySelector<HTMLInputElement>("#input-file");
  const $buttonRead = mustQuerySelector<HTMLButtonElement>("#button-read");
  const $inputPrecision = mustQuerySelector<HTMLInputElement>("#input-precision");
  const $spanPrecision = mustQuerySelector<HTMLSpanElement>("#precision");
  const $inputSpeed = mustQuerySelector<HTMLInputElement>("#input-speed");
  const $spanDuration = mustQuerySelector<HTMLSpanElement>("#duration");
  const $inputError = mustQuerySelector<HTMLInputElement>("#input-error");
  const $spanError = mustQuerySelector<HTMLSpanElement>("#error");
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
    displayMatrix(matrix, precision);
  });

  let precision = DEFAULT_PRECISION;
  $inputPrecision.addEventListener("input", (e) => {
    const value = Number($inputPrecision.value);
    if (isNaN(precision)) {
      precision = DEFAULT_PRECISION;
      $spanPrecision.textContent = precision.toString();
      return;
    }
    precision = value;
    $spanPrecision.textContent = precision.toString();
    if (!matrix) {
      return;
    }
    displayMatrix(matrix, precision);
  });

  let duration = DEFAULT_DURATION;
  $inputSpeed.addEventListener("input", (e) => {
    const speed = Number($inputSpeed.value);
    if (isNaN(speed)) {
      duration = DEFAULT_DURATION;
      $spanDuration.textContent = duration.toString();
      return;
    }
    duration = Math.max(MIN_DURATION, MAX_DURATION - speed);
    $spanDuration.textContent = duration.toString();
  });

  let error = DEFAULT_ERROR;
  $inputError.addEventListener("input", (e) => {
    const exp = Number($inputError.value);
    if (isNaN(error)) {
      error = DEFAULT_ERROR;
      $spanError.textContent = "1e-3";
      return;
    }
    error = Math.pow(10, exp);
    $spanError.textContent = `1e${exp}`;
  });

  // 行スケーリング
  $buttonRowScaling.addEventListener("click", () => {
    if (!matrix) {
      return;
    }
    matrix.rowScaling();
    displayMatrix(matrix, precision);
  });

  // 列スケーリング
  $buttonColScaling.addEventListener("click", () => {
    if (!matrix) {
      return;
    }
    matrix.colScaling();
    displayMatrix(matrix, precision);
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

    while (true) {
      // 行スケーリング
      matrix.rowScaling();
      displayMatrix(matrix, precision);
      if (matrix.isScaled(error)) {
        break;
      }
      if (!(await sleep(duration, abortController))) {
        break;
      }

      // 列スケーリング
      matrix.colScaling();
      displayMatrix(matrix, precision);
      if (matrix.isScaled(error)) {
        break;
      }
      if (!(await sleep(duration, abortController))) {
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
    displayMatrix(matrix, precision);
  });
};

const mustQuerySelector = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element as T;
};

const displayMatrix = (matrix: Matrix, precision: number) => {
  const $matrixContainer = mustQuerySelector<HTMLDivElement>("#matrix-container");
  $matrixContainer.innerHTML = "";
  $matrixContainer.appendChild(matrix.toHTML(precision));
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
