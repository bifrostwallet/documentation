#!/bin/sh

# Orchestrate supply-chain checks. POSIX sh for Alpine / minimal images.

set -eu

YELLOW='\033[1;33m'
NC='\033[0m'

printf '%b\n' "${YELLOW}Running security checks...${NC}"
echo

printf '%b\n' "${YELLOW}1 of 6: Blocking IDE/agent autostart persistence files...${NC}"
./scripts/security/block-ide-autostart-hooks.sh
./scripts/security/verify-agent-skills.sh
echo

printf '%b\n' "${YELLOW}2 of 6: Verifying Node.js version...${NC}"
./scripts/security/verify-node-version.sh
echo

printf '%b\n' "${YELLOW}3 of 6: Verifying Yarn binary hash...${NC}"
./scripts/security/verify-yarn-hash.sh
echo

printf '%b\n' "${YELLOW}4 of 6: Verifying Yarn dependencies are locked...${NC}"
./scripts/security/verify-yarn-dependencies.sh
echo

printf '%b\n' "${YELLOW}5 of 6: Rejecting bare yarn command invocations...${NC}"
./scripts/security/verify-no-bare-yarn.sh
echo

printf '%b\n' "${YELLOW}6 of 6: Verifying tsconfig module lanes (NodeNext or Bundler)...${NC}"
./scripts/security/verify-tsconfig-lanes.sh
./scripts/security/verify-tsconfig-lanes-fixtures.sh
echo

# The workflow tag rules (verify-version-tags.sh) read .github/ only, and
# this script runs on every ./yarn call, so they are not a numbered step.
# CI and the pre-commit hook run verify-version-tags-if-changed.sh, which
# checks when a file under .github/ or the check itself changed.
#
# A tag or release run is the exception: the rules are always checked there,
# so a release workflow that calls only this script still gets them. This
# repository has no workflow that runs on tags or releases; the branch is for
# one that is added later and for repositories that copy this script.
if [ "${GITHUB_REF_TYPE:-}" = "tag" ] || [ "${GITHUB_EVENT_NAME:-}" = "release" ]; then
  ./scripts/security/verify-version-tags-if-changed.sh
  echo
fi

exit 0
