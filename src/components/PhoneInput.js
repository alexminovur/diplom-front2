import React from 'react';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { PhoneIcon } from '@chakra-ui/icons';

const PhoneInput = ({ value, onChange, ...props }) => {
    return (
        <InputGroup>
            <InputLeftElement pointerEvents='none'>
                <PhoneIcon color='gray.300' />
            </InputLeftElement>
            <Input
                type="tel"
                placeholder="+7 (999) 999-99-99"
                value={value}
                onChange={onChange}
                {...props}
            />
        </InputGroup>
    );
};

export default PhoneInput;
