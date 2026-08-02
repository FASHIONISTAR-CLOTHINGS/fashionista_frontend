import { describe, expect, it } from "vitest";
import { analyzePose } from "../poseIntelligence";
import type { Landmark } from "../../hooks/usePoseLandmarker";

function createLandmarks(): Landmark[] {
  return Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 1,
  }));
}

function createReadyFixture() {
  const normal = createLandmarks();
  normal[0] = { x: 0.5, y: 0.1, z: 0, visibility: 1 };
  normal[11] = { x: 0.4, y: 0.3, z: 0, visibility: 1 };
  normal[12] = { x: 0.6, y: 0.3, z: 0, visibility: 1 };
  normal[23] = { x: 0.43, y: 0.55, z: 0, visibility: 1 };
  normal[24] = { x: 0.57, y: 0.55, z: 0, visibility: 1 };
  normal[25] = { x: 0.43, y: 0.75, z: 0, visibility: 1 };
  normal[26] = { x: 0.57, y: 0.75, z: 0, visibility: 1 };
  normal[27] = { x: 0.4, y: 0.95, z: 0, visibility: 1 };
  normal[28] = { x: 0.6, y: 0.95, z: 0, visibility: 1 };
  normal[15] = { x: 0.3, y: 0.45, z: 0, visibility: 1 };
  normal[16] = { x: 0.7, y: 0.45, z: 0, visibility: 1 };

  const world = createLandmarks();
  world[11] = { x: -0.1, y: 0, z: 0, visibility: 1 };
  world[12] = { x: 0.1, y: 0, z: 0, visibility: 1 };
  world[13] = { x: -0.17, y: -0.17, z: 0, visibility: 1 };
  world[14] = { x: 0.17, y: -0.17, z: 0, visibility: 1 };

  return { normal, world };
}

describe("analyzePose", () => {
  it("reports a centered, full-body, ready pose", () => {
    const result = analyzePose(...Object.values(createReadyFixture()) as [Landmark[], Landmark[]]);

    expect(result.isFullBodyVisible).toBe(true);
    expect(result.distanceStatus).toBe("optimal");
    expect(result.centeringStatus).toBe("centered");
    expect(result.feetStatus).toBe("shoulder_width");
    expect(["approaching_45", "at_45"]).toContain(result.armsStatus);
    expect(result.overallReady).toBe(true);
    expect(result.readinessScore).toBeGreaterThanOrEqual(75);
  });

  it("returns unknown readiness for incomplete landmark input", () => {
    const result = analyzePose(createLandmarks().slice(0, 10), createLandmarks());

    expect(result.overallReady).toBe(false);
    expect(result.distanceStatus).toBe("unknown");
    expect(result.centeringStatus).toBe("unknown");
    expect(result.primaryMessage).toBe("Step in front of the camera");
  });

  it("distinguishes relative distance bands", () => {
    const fixture = createReadyFixture();
    fixture.normal[27] = { ...fixture.normal[27], y: 0.99 };
    fixture.normal[28] = { ...fixture.normal[28], y: 0.99 };
    expect(analyzePose(fixture.normal, fixture.world).distanceStatus).toBe("too_close");

    fixture.normal[27] = { ...fixture.normal[27], y: 0.35 };
    fixture.normal[28] = { ...fixture.normal[28], y: 0.35 };
    expect(analyzePose(fixture.normal, fixture.world).distanceStatus).toBe("too_far");
  });

  it("reports missing ankles and never becomes ready", () => {
    const fixture = createReadyFixture();
    fixture.normal[27] = { ...fixture.normal[27], visibility: 0.1 };
    fixture.normal[28] = { ...fixture.normal[28], visibility: 0.1 };
    const result = analyzePose(fixture.normal, fixture.world);

    expect(result.missingParts).toContain("ankles");
    expect(result.overallReady).toBe(false);
  });
});
