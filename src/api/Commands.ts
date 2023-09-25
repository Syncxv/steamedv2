import { Command } from "@utils/types";
import { i18n, MessageClass } from "@webpack/common";

export const commands: { [key: string]: Command } = {};

export const find = (cb: (c: Command) => boolean) =>
	Object.values(commands).find(cb);

export const registerCommand = (cmd: Command) => {
	if (commands[cmd.name]) throw Error(`Name ${cmd.name} already exists boy`);
	i18n.LocalizationManager.m_mapTokens.set(
		`SteamedSlashCommandDescription_${cmd.name}`,
		cmd.description
	);
	commands[cmd.name] = cmd;
};
export const unRegisterCommand = (name: string) => {
	let value: boolean;
	commands[name]
		? (delete commands[name],
		  i18n.LocalizationManager.m_mapTokens.delete(
				`SteamedSlashCommandDescription_${name}`
		  ),
		  (value = true))
		: (value = false);
	return value;
};

export const processCommand = async (thisObj: any) => {
	if (!thisObj.state.messageInput.startsWith("/")) return;
	const message: string = thisObj.state.messageInput;
	const [cmd, ...cmdArgs] = message.slice(1).split(" ");
	console.log(cmd, cmdArgs, MessageClass);

	const command = find((c) => c.name.toLowerCase().includes(cmd.toLowerCase()));
	if (!command) return;

	let result: any;

	try {
		result = await command.execute(cmdArgs, this);
	} catch (e: any) {
		result = {
			send: false,
			result: `An error occurred while executing the command: ${e.message}.\nCheck the console for more details.`,
		};

		console.error(
			"An error occurred while executing command %s: %o",
			command.name,
			e
		);
	}

	if (!result || !result.result) {
		return;
	}

	if (result.send) {
		thisObj.state.messageInput = result.result;
	} else {
		thisObj.state.messageInput = "";
		const msg = new MessageClass(
			-1,
			g_FriendsUIApp.m_CMInterface.GetServerRTime32(),
			result.result
		);
		// idk how to change avatar and stuff
		thisObj.props.chatView.chat.InternalAppendChatMsg(msg);
		thisObj.setState({ ...thisObj.state, messageInput: "" });
	}
};
