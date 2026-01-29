package com.talha.supermarket.MapStruct;

import com.talha.supermarket.dto.StoreDto;
import com.talha.supermarket.model.Store;
import com.talha.supermarket.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface StoreMapper {

    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "managerName", source = "manager.name")
    StoreDto toStoreDto(Store store);

    @Mapping(target = "manager", source = "managerId", qualifiedByName = "managerIdToManager")
    Store toStore(StoreDto storeDto);

    @Named("managerIdToManager")
    default User managerIdToManager(Long managerId) {
        if (managerId == null) return null;
        User user = new User();
        user.setId(managerId);
        return user;
    }
}
