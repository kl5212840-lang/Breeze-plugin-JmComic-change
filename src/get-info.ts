// 本插件使用**自有 uuid**，与官方禁漫插件（bf99008d-010b-4f17-ac7c-61a9b57dc3d9）
// 作为两个独立条目并存，互不覆盖。
//
// 注意：Breeze 宿主目前把官方 uuid 硬编码为页图反混淆开关
// （lib/network/http/picture/picture.dart 的 _kJmPluginUuid），所以换 uuid 后
// 宿主不会自动反混淆，页面图会呈现分块错乱。为此本插件在 getInfo 里声明
// `pageImageDecode`；宿主支持该声明后即恢复正常。
const JM_PLUGIN_ID = "6886291b-f524-441c-844b-c2efae9899a9";

type Scene = Record<string, unknown>;

type BuildPluginInfoInput = {
  buildLatestScene: () => Scene;
  buildRankingScene: () => Scene;
};

export function buildPluginInfo(input: BuildPluginInfoInput) {
  return {
    name: "禁漫天堂(mumushu0501-boop)",
    uuid: JM_PLUGIN_ID,
    iconUrl:
      "https://raw.githubusercontent.com/Mumushu0501-boop/Breeze-plugin-JmComic-change/main/assets/fO.webp",
    creator: {
      name: "Mumushu0501-boop",
      describe: "https://github.com/Mumushu0501-boop",
    },
    describe: "禁漫天堂插件（含评论(实验）、线路测速、图片多线路回退）",
    version: "0.2.0",
    // 页面图由服务端分块打乱，声明后由宿主在落盘前重排还原（禁漫反混淆）。
    pageImageDecode: { type: "jmSegmentation" },
    home: "https://github.com/Mumushu0501-boop/Breeze-plugin-JmComic-change",
    updateUrl:
      "https://api.github.com/repos/Mumushu0501-boop/Breeze-plugin-JmComic-change/releases/latest",
    function: [
      {
        id: "recommend",
        title: "推荐",
        action: {
          type: "openPluginFunction" as const,
          payload: {
            id: "recommend",
            title: "推荐",
            presentation: "page" as const,
          },
        },
      },
      {
        id: "latest",
        title: "最新",
        action: {
          type: "openComicList" as const,
          payload: { scene: input.buildLatestScene() },
        },
      },
      {
        id: "ranking",
        title: "排行榜",
        action: {
          type: "openComicList" as const,
          payload: { scene: input.buildRankingScene() },
        },
      },
      {
        id: "cloudFavorite",
        title: "云端收藏",
        action: {
          type: "openCloudFavorite" as const,
          payload: { title: "云端收藏" },
        },
      },
    ],
  };
}

function buildManifestComicListScene(input: {
  title: string;
  list: {
    fnPath: string;
    core?: Record<string, unknown>;
    extern?: Record<string, unknown>;
  };
  filter?: {
    fnPath: string;
    core?: Record<string, unknown>;
    extern?: Record<string, unknown>;
  };
}) {
  return {
    title: input.title,
    source: JM_PLUGIN_ID,
    list: {
      fnPath: input.list.fnPath,
      core: input.list.core ?? {},
      extern: input.list.extern ?? {},
    },
    ...(input.filter
      ? {
          filter: {
            fnPath: input.filter.fnPath,
            core: input.filter.core ?? {},
            extern: input.filter.extern ?? {},
          },
        }
      : {}),
  };
}

export function buildManifestInfo() {
  return buildPluginInfo({
    buildLatestScene: () =>
      buildManifestComicListScene({
        title: "最新",
        list: {
          fnPath: "getLatestData",
          extern: { source: "latest" },
        },
      }),
    buildRankingScene: () =>
      buildManifestComicListScene({
        title: "禁漫排行榜",
        list: {
          fnPath: "getRankingData",
          extern: { source: "ranking" },
        },
        filter: {
          fnPath: "getRankingFilterBundle",
          extern: { source: "ranking" },
        },
      }),
  });
}
