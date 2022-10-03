import { useEffect, useState, useMemo } from "react";
import { useWallet } from "@cosmos-kit/react";
import { assets } from "chain-registry";
import { AssetList, Asset } from "@chain-registry/types";

// import cosmwasm client generated with cosmwasm-ts-codegen
import { HackCw20QueryClient } from "../codegen/HackCw20.client";

import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  Container,
  Link,
  Button,
  Flex,
  Icon,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import { dependencies, products } from "../config";

import { WalletStatus } from "@cosmos-kit/core";
import { Product, Dependency, WalletSection } from "../components";
import Head from "next/head";
import PopUpAtom from "../components/ui/atoms/PopUpAtom/PopUp.atom";
import { Layout } from "../styles/Layout.styled";
import HeaderLayout from "../components/ui/layout/HeaderLayout/Header.layout";
import FooterLayout from "../components/ui/layout/FooterLayout/Footer.layout";
import MainLayoutLayout from "../components/ui/layout/MainLayout/MainLayout.layout";

import projects from "../data-project/projects.json";
import { configFunctions, cw20Config } from "../smart-contract-config/config";
import {
  NativeStakeClient,
  NativeStakeQueryClient,
} from "../codegen/NativeStake.client";
import Card from "../components/ui/organisms/CardOrganism/Card.organism";
import { coins } from "@cosmjs/stargate";

const library = {
  title: "OsmoJS",
  text: "OsmoJS",
  href: "https://github.com/osmosis-labs/osmojs",
};

// const chainName = 'osmosis';
const chainName = "osmosistestnet";
const chainassets: AssetList = assets.find(
  (chain) => chain.chain_name === chainName
) as AssetList;
const coin: Asset = chainassets.assets.find(
  (asset) => asset.base === "uosmo"
) as Asset;

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    getStargateClient,
    getCosmWasmClient,
    address,
    setCurrentChain,
    currentWallet,
    walletStatus,
  } = useWallet();

  useEffect(() => {
    setCurrentChain(chainName);
  }, [chainName]);

  const color = useColorModeValue("primary.500", "primary.200");
  const [listProjects, setListProject] = useState(projects.projects);
  // get cw20 balance
  const [cw20Client, setCw20Client] = useState<HackCw20QueryClient | null>(
    null
  );
  const [writeProject, setWriteProject] = useState<
    Array<NativeStakeClient | null>
  >([]);
  const [getProject, setGetProject] = useState<
    Array<NativeStakeQueryClient | null>
  >([]);

  const getConfig = async (cosmwasmClient: any) => {
    const config = await configFunctions(cosmwasmClient, address, listProjects);
    setListProject(config.listProjects);
    const osmosisInstances = config.config;
    const cw20 = cw20Config(cosmwasmClient, address);
    setCw20Client(cw20.getData);
    for (let i = 0; i < listProjects.length; i++) {
      setWriteProject([...writeProject, osmosisInstances[i].stake]);
      setGetProject([...getProject, osmosisInstances[i].stakeQuery]);
    }
  };

  useEffect(() => {
    getCosmWasmClient().then((cosmwasmClient) => {
      if (!cosmwasmClient || !address) {
        console.error("stargateClient undefined or address undefined.");
        return;
      }
      getConfig(cosmwasmClient);
    });
  }, [address, getCosmWasmClient]);
  const [cw20Bal, setCw20Bal] = useState<string | null>(null);
  useEffect(() => {
    if (cw20Client && address) {
      cw20Client
        .balance({
          // TODO: replace with `address` !!!
          address: "osmo10vcqfvecwmvfr46cn0ju024xz7khutjtdsg5ga",
        })
        .then((b) => setCw20Bal(b.balance));
    }
  }, [cw20Client, address]);

  const lockAmount = (e, index: number) => {
    const amount = e.target[0].value;
    const nameToken = listProjects[index].token;
    writeProject[index]
      ?.stake("auto", undefined, coins(amount, nameToken))
      .then(alert)
      .catch((e) => console.log(e));
  };

  return (
    <MainLayoutLayout>
      <Container maxW="5xl" py={10}>
        <Head>
          <title>Reverse Osmosis</title>
          <meta name="description" content="Generated by create cosmos app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {listProjects.length > 0 &&
          address &&
          listProjects.map((el, index) => (
            <div key={el.contract} id={index} style={{ margin: "1rem" }}>
              <Card status={el?.status} />
            </div>
          ))}
        {/* listProjects.map((el, index) => {el.status == "OPEN" && <div key={el.contract} id={index} style={{margin: "1rem"}}><Card status={el?.status} name={el.name} value={el.balance.value} close = {el.close}/></div>})} */}
        {/* <WalletSection chainName={chainName} /> */}

        {/* <div>

          HackCW20 Balance:{" "}
          {walletStatus === WalletStatus.Disconnected
            ? "Connect wallet!"
            : cw20Bal ?? "loading..."}
        </div> */}

        {walletStatus === WalletStatus.Disconnected && (
          <Box textAlign="center">
            <div>
              <img
                src="/logo-text-only.png"
                style={{ maxHeight: "80px" }}
              ></img>
            </div>
            <Heading
              as="h3"
              fontSize={{ base: "1xl", sm: "2xl", md: "2xl" }}
              fontWeight="extrabold"
              m={30}
            >
              Connect your wallet!
            </Heading>
          </Box>
        )}
      </Container>
      {/* <PopUpAtom /> */}
    </MainLayoutLayout>
  );
}
