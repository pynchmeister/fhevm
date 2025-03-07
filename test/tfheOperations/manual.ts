import { fail } from 'assert';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import type { TFHEManualTestSuite } from '../../types/contracts/tests/TFHEManualTestSuite';
import { OPTIMISTIC_REQUIRES_ENABLED } from '../generated';
import { createInstances } from '../instance';
import { getSigners, initSigners } from '../signers';

async function deployTfheManualTestFixture(): Promise<TFHEManualTestSuite> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('TFHEManualTestSuite');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

describe('TFHE manual operations', function () {
  before(async function () {
    await initSigners(1);
    this.signers = await getSigners();

    const contract = await deployTfheManualTestFixture();
    this.contractAddress = await contract.getAddress();
    this.contract = contract;
    const instances = await createInstances(this.contractAddress, ethers, this.signers);
    this.instances = instances;
  });

  it('Cmux works returning if false', async function () {
    const res = await this.contract.test_cmux(
      this.instances.alice.encrypt8(0),
      this.instances.alice.encrypt32(3),
      this.instances.alice.encrypt32(4),
    );
    expect(res).to.equal(4);
  });

  it('Cmux works returning if true', async function () {
    const res = await this.contract.test_cmux(
      this.instances.alice.encrypt8(1),
      this.instances.alice.encrypt32(3),
      this.instances.alice.encrypt32(4),
    );
    expect(res).to.equal(3);
  });

  it('ebool to euint16 casting works with true', async function () {
    const res = await this.contract.test_ebool_to_euint16_cast(true);
    expect(res).to.equal(1);
  });

  it('ebool to euint16 casting works with false', async function () {
    const res = await this.contract.test_ebool_to_euint16_cast(false);
    expect(res).to.equal(0);
  });

  it('ebool to euint32 casting works with true', async function () {
    const res = await this.contract.test_ebool_to_euint32_cast(true);
    expect(res).to.equal(1);
  });

  it('ebool to euint32 casting works with false', async function () {
    const res = await this.contract.test_ebool_to_euint32_cast(false);
    expect(res).to.equal(0);
  });

  it('ebool to euint64 casting works with true', async function () {
    const res = await this.contract.test_ebool_to_euint64_cast(true);
    expect(res).to.equal(1);
  });

  it('ebool to euint32 casting works with false', async function () {
    const res = await this.contract.test_ebool_to_euint64_cast(false);
    expect(res).to.equal(0);
  });

  it('ebool not for false is true', async function () {
    const res = await this.contract.test_ebool_not(false);
    expect(res).to.equal(true);
  });

  it('ebool not for true is false', async function () {
    const res = await this.contract.test_ebool_not(true);
    expect(res).to.equal(false);
  });

  it('ebool and', async function () {
    expect(await this.contract.test_ebool_and(false, false)).to.equal(false);
    expect(await this.contract.test_ebool_and(false, true)).to.equal(false);
    expect(await this.contract.test_ebool_and(true, false)).to.equal(false);
    expect(await this.contract.test_ebool_and(true, true)).to.equal(true);
  });

  it('ebool or', async function () {
    expect(await this.contract.test_ebool_or(false, false)).to.equal(false);
    expect(await this.contract.test_ebool_or(false, true)).to.equal(true);
    expect(await this.contract.test_ebool_or(true, false)).to.equal(true);
    expect(await this.contract.test_ebool_or(true, true)).to.equal(true);
  });

  it('ebool xor', async function () {
    expect(await this.contract.test_ebool_xor(false, false)).to.equal(false);
    expect(await this.contract.test_ebool_xor(false, true)).to.equal(true);
    expect(await this.contract.test_ebool_xor(true, false)).to.equal(true);
    expect(await this.contract.test_ebool_xor(true, true)).to.equal(false);
  });

  if (OPTIMISTIC_REQUIRES_ENABLED) {
    it('optimistic require with true succeeds', async function () {
      await this.contract.test_opt_req(true);
    });

    it('optimistic require with false fails', async function () {
      try {
        await this.contract.test_opt_req(false);
        fail('This should fail');
      } catch (e: any) {
        expect(e.message).to.contain('execution reverted');
      }
    });

    it('stateful optimistic require with true succeeds', async function () {
      const res = await this.contract.test_opt_req_stateful(true);
      const receipt = await res.wait();
      expect(receipt.status).to.equal(1);
    });

    it('stateful optimistic require with false fails', async function () {
      try {
        const res = await this.contract.test_opt_req_stateful(false);
        const _ = await res.wait();
        fail('This should fail');
      } catch (e: any) {
        expect(e.toString()).to.contain('transaction execution reverted');
      }
    });
  }
});
