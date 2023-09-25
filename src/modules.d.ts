declare module "~plugins" {
	const plugins: Record<string, import("@utils/types").Plugin>;
	export default plugins;
}

declare module "*.css";
declare module "*.scss";
