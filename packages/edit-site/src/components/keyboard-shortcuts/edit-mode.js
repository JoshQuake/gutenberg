/**
 * WordPress dependencies
 */
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { SIDEBAR_BLOCK } from '../sidebar-edit-mode/constants';
import { unlock } from '../../lock-unlock';

const { interfaceStore } = unlock( editorPrivateApis );

function KeyboardShortcutsEditMode() {
	const isBlockInspectorOpen = useSelect(
		( select ) =>
			select( interfaceStore ).getActiveComplementaryArea( 'core' ) ===
			SIDEBAR_BLOCK,
		[]
	);
	const { enableComplementaryArea, disableComplementaryArea } =
		useDispatch( interfaceStore );
	const { replaceBlocks } = useDispatch( blockEditorStore );
	const { getBlockName, getSelectedBlockClientId, getBlockAttributes } =
		useSelect( blockEditorStore );

	const handleTextLevelShortcut = ( event, level ) => {
		event.preventDefault();
		const destinationBlockName =
			level === 0 ? 'core/paragraph' : 'core/heading';
		const currentClientId = getSelectedBlockClientId();
		if ( currentClientId === null ) {
			return;
		}
		const blockName = getBlockName( currentClientId );
		if ( blockName !== 'core/paragraph' && blockName !== 'core/heading' ) {
			return;
		}
		const attributes = getBlockAttributes( currentClientId );
		const textAlign =
			blockName === 'core/paragraph' ? 'align' : 'textAlign';
		const destinationTextAlign =
			destinationBlockName === 'core/paragraph' ? 'align' : 'textAlign';

		replaceBlocks(
			currentClientId,
			createBlock( destinationBlockName, {
				level,
				content: attributes.content,
				...{ [ destinationTextAlign ]: attributes[ textAlign ] },
			} )
		);
	};

	useShortcut( 'core/edit-site/toggle-block-settings-sidebar', ( event ) => {
		// This shortcut has no known clashes, but use preventDefault to prevent any
		// obscure shortcuts from triggering.
		event.preventDefault();

		if ( isBlockInspectorOpen ) {
			disableComplementaryArea( 'core' );
		} else {
			enableComplementaryArea( 'core', SIDEBAR_BLOCK );
		}
	} );

	useShortcut( 'core/edit-site/transform-heading-to-paragraph', ( event ) =>
		handleTextLevelShortcut( event, 0 )
	);

	[ 1, 2, 3, 4, 5, 6 ].forEach( ( level ) => {
		//the loop is based off on a constant therefore
		//the hook will execute the same way every time
		//eslint-disable-next-line react-hooks/rules-of-hooks
		useShortcut(
			`core/edit-site/transform-paragraph-to-heading-${ level }`,
			( event ) => handleTextLevelShortcut( event, level )
		);
	} );

	return null;
}

export default KeyboardShortcutsEditMode;
