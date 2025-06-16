
/**
 * A reducer for developer mode
 */
const initialState = {
    developerMode: false,
};

export default function developerMode(state = initialState, action: any) {
    switch (action.type) {
        case 'TURN_ON_DEVELOPER_MODE':
            return {
                ...state,
                developerMode: true,
            };
        case 'TURN_OFF_DEVELOPER_MODE':
            return {
                ...state,
                developerMode: false,
            };
        default:
            return state;
    }
}
