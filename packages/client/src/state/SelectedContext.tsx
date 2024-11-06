import { createContext, useContext, useMemo, useState } from "react";

interface ISelectedContext {
    selected: string | null;
    setSelected: (id: string) => void;
}

const SelectedContext = createContext<ISelectedContext>({
    selected: null,
    setSelected: () => {},
});

interface ISelectedProviderProps {
    children: React.ReactNode;
}

export const SelectedProvider: React.FC<ISelectedProviderProps> = ({
    children,
}) => {
    const [selected, setSelected] = useState<string | null>(null);

    const state = useMemo(
        () => ({ selected, setSelected }),
        [selected, setSelected]
    );

    return (
        <SelectedContext.Provider value={state}>
            {children}
        </SelectedContext.Provider>
    );
};

export const useSelectedImageId = () => {
    const { selected } = useContext(SelectedContext);

    return selected;
};

export const useSetSelectedImageId = () => {
    const { setSelected } = useContext(SelectedContext);

    return setSelected;
};
