import React, { useRef } from "react"
import MoveSound from '../../assets/Move.mp3';
import NewGameSound from '../../assets/NewGame.mp3';
import UndoSound from '../../assets/Undo.mp3';
import SwitchSound from '../../assets/Switch.mp3';

function AudioElements({ newGameAudio, moveAudio, undoAudio, switchAudio}) {
    return (
        <>
        <audio ref={newGameAudio} src={NewGameSound} />
        <audio ref={moveAudio} src={MoveSound} />
        <audio ref={undoAudio} src={UndoSound} />
        <audio ref={switchAudio} src={SwitchSound} />
        </>
    )
}

export default function useAudio() {
    const moveAudio = useRef(null);
    const newGameAudio = useRef(null);
    const undoAudio = useRef(null);
    const switchAudio = useRef(null);
    const renderAudioElements = () => <AudioElements {...{newGameAudio, moveAudio, undoAudio, switchAudio}} />

    const playMoveAudio = () => moveAudio.current.play();
    const playNewGameAudio = () => newGameAudio.current.play();
    const playUndoAudio = () => undoAudio.current.play();
    const playSwitchAudio = () => switchAudio.current.play();

    return { playMoveAudio, playNewGameAudio, playUndoAudio, playSwitchAudio, renderAudioElements }
}