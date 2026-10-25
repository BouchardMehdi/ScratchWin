import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("la production refuse les secrets absents, faibles et d'exemple", () => {
  for (const secret of ["", "short", "change_this_secret", "development_only_change_this_secret"]) {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", "await import('./src/config/env.js')"], {
      env: { ...process.env, NODE_ENV: "production", JWT_SECRET: secret }, encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /JWT_SECRET/);
  }
});

test("la production accepte un secret explicite suffisamment long", () => {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", "await import('./src/config/env.js')"], {
    env: { ...process.env, NODE_ENV: "production", JWT_SECRET: "test_only_6e187f07c64b01e851aaceea7159947b" }, encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
});
