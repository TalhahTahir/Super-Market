package com.talha.supermarket.MapStruct;

import com.talha.supermarket.dto.StoreDto;
import com.talha.supermarket.model.Store;
import com.talha.supermarket.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface StoreMapper {

    StoreMapper INSTANCE = Mappers.getMapper(StoreMapper.class);

    @Mapping(target = "managerId", source = "manager", qualifiedByName = "managerToManagerId")
    StoreDto toStoreDto(Store store);

    @Mapping(target = "manager", source = "managerId", qualifiedByName = "managerIdToManager")
    Store toStore(StoreDto storeDto);

    @Named("managerToManagerId")
    default Long managerToManagerId(User manager) {
        return manager != null ? manager.getId() : null;
    }

    @Named("managerIdToManager")
    default User managerIdToManager(Long managerId) {
        if (managerId == null) return null;
        User user = new User();
        user.setId(managerId);
        return user;
    }
}
