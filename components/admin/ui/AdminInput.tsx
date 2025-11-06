import React from 'react';
import InputWithCounter from './InputWithCounter';

// This component now acts as a simplified wrapper around InputWithCounter
// for backward compatibility or simpler use cases if needed.
const AdminInput = (props: any) => {
    return <InputWithCounter {...props} />;
};

export default AdminInput;