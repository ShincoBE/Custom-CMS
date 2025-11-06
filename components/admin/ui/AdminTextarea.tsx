import React from 'react';
import InputWithCounter from './InputWithCounter';

// This component now acts as a simplified wrapper around InputWithCounter
// for backward compatibility or simpler use cases if needed.
const AdminTextarea = (props: any) => {
    return <InputWithCounter as="textarea" {...props} />;
};

export default AdminTextarea;