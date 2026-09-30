const fs = require("fs");
const path = require("path");

const financeDir = path.join("src", "features", "finance");
const servicesDir = path.join(financeDir, "services");
const sourceFile = path.join(financeDir, "finance.service.ts");

if (!fs.existsSync(sourceFile)) {
  console.error(`Arquivo não encontrado: ${sourceFile}`);
  process.exit(1);
}

fs.mkdirSync(servicesDir, { recursive: true });

const source = fs.readFileSync(sourceFile, "utf8");

/**
 * =====================================================
 * LOCALIZA TODAS AS FUNÇÕES
 * =====================================================
 */

const functionRegex =
  /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/g;

const functionPositions = [];

let match;

while ((match = functionRegex.exec(source)) !== null) {
  functionPositions.push({
    name: match[1],
    start: match.index,
  });
}

if (functionPositions.length === 0) {
  console.error(
    "Nenhuma função foi encontrada em finance.service.ts.",
  );
  process.exit(1);
}

/**
 * =====================================================
 * EXTRAI FUNÇÃO
 * =====================================================
 */

function extractFunction(name) {
  const index = functionPositions.findIndex(
    (item) => item.name === name,
  );

  if (index === -1) {
    throw new Error(
      `Função não encontrada: ${name}`,
    );
  }

  const current = functionPositions[index];

  const next =
    functionPositions[index + 1];

  const end = next
    ? next.start
    : source.length;

  let content = source
    .slice(current.start, end)
    .trim();

  /*
   * Garante export.
   */
  if (!content.startsWith("export ")) {
    content = `export ${content}`;
  }

  return content;
}

/**
 * =====================================================
 * EXTRAI INTERFACE
 * =====================================================
 */

function extractTransferInterface() {
  const regex =
    /(?:export\s+)?interface\s+TransferFinanceAccountInput\s*\{/;

  const match = regex.exec(source);

  if (!match) {
    throw new Error(
      "Interface TransferFinanceAccountInput não encontrada.",
    );
  }

  const start = match.index;

  const transferIndex =
    functionPositions.findIndex(
      (item) =>
        item.name ===
        "transferBetweenFinanceAccounts",
    );

  if (transferIndex === -1) {
    throw new Error(
      "Função transferBetweenFinanceAccounts não encontrada.",
    );
  }

  const end =
    functionPositions[transferIndex].start;

  let content = source
    .slice(start, end)
    .trim();

  if (!content.startsWith("export ")) {
    content = `export ${content}`;
  }

  return content;
}

/**
 * =====================================================
 * ESCRITA
 * =====================================================
 */

function writeRoot(file, content) {
  const target = path.join(
    financeDir,
    file,
  );

  fs.writeFileSync(
    target,
    content.trim() + "\n",
    "utf8",
  );

  console.log(`OK  ${target}`);
}

function writeService(file, content) {
  const target = path.join(
    servicesDir,
    file,
  );

  fs.writeFileSync(
    target,
    content.trim() + "\n",
    "utf8",
  );

  console.log(`OK  ${target}`);
}

/**
 * =====================================================
 * EXTRAÇÃO
 * =====================================================
 */

console.log("");
console.log("========================================");
console.log("LENDO finance.service.ts");
console.log("========================================");
console.log("");

const functions = {};

const names = [
  "getCurrentUserId",

  "mapFinanceAccount",
  "mapFinanceCategory",
  "mapAccountReceivable",
  "mapReceivableInstallment",
  "mapAccountPayable",
  "mapPayableInstallment",
  "mapCashMovement",

  "getFinanceAccounts",
  "getFinanceAccount",
  "createFinanceAccount",
  "updateFinanceAccount",
  "getOrCreateDefaultFinanceAccount",

  "getFinanceCategories",
  "createDefaultFinanceCategories",

  "getAccountsReceivable",
  "getAccountReceivable",
  "getReceivableInstallments",
  "createReceivableFromOrder",
  "payReceivableInstallment",

  "getAccountsPayable",
  "getAccountPayable",
  "getPayableInstallments",
  "createPayable",
  "payPayableInstallment",

  "getCashMovements",
  "getFinanceSummary",
  "getCashFlow",

  "transferBetweenFinanceAccounts",
];

for (const name of names) {
  console.log(`Extraindo: ${name}`);
  functions[name] = extractFunction(name);
}

const transferInterface =
  extractTransferInterface();

/**
 * =====================================================
 * AUTH
 * =====================================================
 */

writeRoot(
  "finance.auth.ts",
  `${functions.getCurrentUserId}
`,
);

/**
 * =====================================================
 * MAPPERS
 * =====================================================
 */

writeRoot(
  "finance.mappers.ts",
  `import type {
  AccountPayable,
  AccountReceivable,
  CashMovement,
  FinanceAccount,
  FinanceCategory,
  PayableInstallment,
  ReceivableInstallment,
} from "./finance.types";

${functions.mapFinanceAccount}

${functions.mapFinanceCategory}

${functions.mapAccountReceivable}

${functions.mapReceivableInstallment}

${functions.mapAccountPayable}

${functions.mapPayableInstallment}

${functions.mapCashMovement}
`,
);

/**
 * =====================================================
 * CONTAS
 * =====================================================
 */

writeService(
  "finance.accounts.service.ts",
  `import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import { mapFinanceAccount } from "../finance.mappers";

import type {
  FinanceAccount,
} from "../finance.types";

${functions.getFinanceAccounts}

${functions.getFinanceAccount}

${functions.createFinanceAccount}

${functions.updateFinanceAccount}

${functions.getOrCreateDefaultFinanceAccount}
`,
);

/**
 * =====================================================
 * CATEGORIAS
 * =====================================================
 */

writeService(
  "finance.categories.service.ts",
  `import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import { mapFinanceCategory } from "../finance.mappers";

import type {
  FinanceCategory,
} from "../finance.types";

${functions.getFinanceCategories}

${functions.createDefaultFinanceCategories}
`,
);

/**
 * =====================================================
 * A RECEBER
 * =====================================================
 */

writeService(
  "finance.receivables.service.ts",
  `import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import {
  mapAccountReceivable,
  mapReceivableInstallment,
} from "../finance.mappers";

import type {
  AccountReceivable,
  CreateReceivableFromOrderInput,
  PayInstallmentInput,
  ReceivableInstallment,
} from "../finance.types";

const DEFAULT_PAGE_SIZE = 10;

${functions.getAccountsReceivable}

${functions.getAccountReceivable}

${functions.getReceivableInstallments}

${functions.createReceivableFromOrder}

${functions.payReceivableInstallment}
`,
);

/**
 * =====================================================
 * A PAGAR
 * =====================================================
 */

writeService(
  "finance.payables.service.ts",
  `import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import {
  mapAccountPayable,
  mapPayableInstallment,
} from "../finance.mappers";

import type {
  AccountPayable,
  CreatePayableInput,
  PayableInstallment,
  PayInstallmentInput,
} from "../finance.types";

const DEFAULT_PAGE_SIZE = 10;

${functions.getAccountsPayable}

${functions.getAccountPayable}

${functions.getPayableInstallments}

${functions.createPayable}

${functions.payPayableInstallment}
`,
);

/**
 * =====================================================
 * CAIXA
 * =====================================================
 */

writeService(
  "finance.cash.service.ts",
  `import { supabase } from "@/lib/supabase";

import { getCurrentUserId } from "../finance.auth";

import { mapCashMovement } from "../finance.mappers";

import type {
  CashFlowPoint,
  CashMovement,
  FinanceSummary,
} from "../finance.types";

const DEFAULT_PAGE_SIZE = 10;

${functions.getCashMovements}

${functions.getFinanceSummary}

${functions.getCashFlow}
`,
);

/**
 * =====================================================
 * TRANSFERÊNCIAS
 * =====================================================
 */

writeService(
  "finance.transfers.service.ts",
  `import { supabase } from "@/lib/supabase";

${transferInterface}

${functions.transferBetweenFinanceAccounts}
`,
);

/**
 * =====================================================
 * FINAL
 * =====================================================
 */

console.log("");
console.log("========================================");
console.log("FINANCE REFATORADO");
console.log("========================================");
console.log("");
console.log(
  "finance.service.ts foi preservado.",
);
console.log("");