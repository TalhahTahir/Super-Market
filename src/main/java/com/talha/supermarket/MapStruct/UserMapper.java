package com.talha.supermarket.MapStruct;

import com.talha.supermarket.dto.CreateUserDto;
import com.talha.supermarket.dto.UserDto;
import com.talha.supermarket.enums.Role;
import com.talha.supermarket.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "role", source = "role", qualifiedByName = "roleToString")
    UserDto toUserDto(User user);

    @Mapping(target = "role", source = "role", qualifiedByName = "stringToRole")
    @Mapping(target = "id", ignore = true)
    User toUser(CreateUserDto createUserDto);

    @Mapping(target = "role", source = "role", qualifiedByName = "stringToRole")
    User toUser(UserDto userDto);

    @Named("roleToString")
    default String roleToString(Role role) {
        return role != null ? role.name() : null;
    }

    @Named("stringToRole")
    default Role stringToRole(String role) {
        return role != null ? Role.valueOf(role) : null;
    }
}
