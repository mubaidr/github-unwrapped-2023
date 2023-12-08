import { useEffect, useMemo, useState } from "react";
import { random } from "remotion";
import type { z } from "zod";
import { generateRandomCorner } from "../../remotion/TopLanguages/corner";
import type { RenderRequest, Rocket } from "../../src/config";
import {
  LanguagesEnum,
  PlanetEnum,
  accentColorValues,
  rocketValues,
  type compositionSchema,
  type languageSchema,
} from "../../src/config";
import type { ProfileStats } from "../../src/server/db";
import { Navbar } from "../Home/Navbar";
import { NotFound } from "../NotFound/NotFound";
import { VideoPageBackground } from "./Background";
import { VideoBox } from "./VideoBox";
import styles from "./styles.module.css";
declare global {
  interface Window {
    __USER__: ProfileStats | null;
  }
}

type CompositionParameters = z.infer<typeof compositionSchema>;

const computePlanet = (userStats: ProfileStats): z.infer<typeof PlanetEnum> => {
  if (userStats.totalContributions >= 5000) {
    return PlanetEnum.Enum.Gold;
  }

  if (userStats.totalContributions > 1000) {
    return PlanetEnum.Enum.Silver;
  }

  return PlanetEnum.Enum.Ice;
};

const parseTopLanguage = (topLanguage: {
  languageName: string;
  color: string;
}): z.infer<typeof languageSchema> => {
  try {
    const lang = LanguagesEnum.parse(topLanguage.languageName);
    return {
      type: "designed",
      name: lang,
    };
  } catch (e) {
    return {
      type: "other",
      color: topLanguage.color,
      name: topLanguage.languageName,
    };
  }
};

const computeCompositionParameters = (
  userStats: ProfileStats,
): CompositionParameters => {
  const accentColor =
    accentColorValues[
      Math.floor(
        random(userStats.lowercasedUsername + "accent") *
          accentColorValues.length,
      )
    ];

  const rocket =
    rocketValues[
      Math.floor(
        random(userStats.lowercasedUsername + "rocket") * rocketValues.length,
      )
    ];
  return {
    login: userStats.username,
    corner: generateRandomCorner({
      lowercasedUsername: userStats.lowercasedUsername,
    }),
    topLanguages:
      userStats.topLanguages.length > 0
        ? {
            language1: parseTopLanguage(userStats.topLanguages[0]),
            language2:
              userStats.topLanguages.length > 1
                ? parseTopLanguage(userStats.topLanguages[1])
                : null,
            language3:
              userStats.topLanguages.length > 2
                ? parseTopLanguage(userStats.topLanguages[2])
                : null,
          }
        : null,
    showHelperLine: false,
    planet: computePlanet(userStats),
    starsGiven: userStats.totalStars,
    issuesClosed: userStats.closedIssues,
    issuesOpened: userStats.openIssues,
    totalPullRequests: userStats.totalPullRequests,
    topWeekday: userStats.topWeekday,
    topHour: userStats.topHour,
    graphData: userStats.graphData,
    openingSceneStartAngle:
      random(userStats.lowercasedUsername + "startAngle") > 0.5
        ? "left"
        : "right",
    accentColor,
    rocket,
    contributionData: userStats.contributionData,
    sampleStarredRepos: userStats.sampleStarredRepos,
  };
};

const background: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "absolute",
};

export const UserPage = ({ user }: { user: ProfileStats }) => {
  const inputProps = useMemo(() => {
    return computeCompositionParameters(user);
  }, [user]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rocket, setRocket] = useState<Rocket>(inputProps.rocket);
  const [startPolling, setStartPolling] = useState(false);

  useEffect(() => {
    const root = document.body;
    if (isModalOpen) {
      root.style.overflow = "hidden";
    } else {
      root.style.overflow = "visible";
    }
  }, [isModalOpen]);

  const derivedInputProps = useMemo(() => {
    if (inputProps && rocket) {
      return {
        ...inputProps,
        rocket,
      };
    }

    return inputProps;
  }, [inputProps, rocket]);

  useEffect(() => {
    if (derivedInputProps) {
      const renderRequest: z.infer<typeof RenderRequest> = {
        inputProps: derivedInputProps,
        username: user.username,
      };

      fetch("/api/render", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(renderRequest),
      })
        .then(() => {
          setStartPolling(true);
        })
        .catch((e) => {
          // TODO - could be better
          setStartPolling(true);
          console.log(e);
        });
    }
  }, [derivedInputProps, user.username]);

  if (derivedInputProps === null) {
    return <NotFound />;
  }

  return (
    <div
      className={styles.wrapper}
      style={{
        backgroundColor: "#000",
      }}
    >
      <div style={background} id="videobackground">
        <VideoPageBackground />
      </div>
      <Navbar />
      <VideoBox
        inputProps={derivedInputProps}
        startPolling={startPolling}
        rocket={rocket}
        setRocket={setRocket}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};
