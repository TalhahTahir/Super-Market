package com.talha.supermarket.MapStruct;

import com.talha.supermarket.dto.ProductDto;
import com.talha.supermarket.model.Product;
import com.talha.supermarket.model.Store;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);

    @Mapping(target = "storeId", source = "store", qualifiedByName = "storeToStoreId")
    ProductDto toProductDto(Product product);

    @Mapping(target = "store", source = "storeId", qualifiedByName = "storeIdToStore")
    Product toProduct(ProductDto productDto);

    @Named("storeToStoreId")
    default Long storeToStoreId(Store store) {
        return store != null ? store.getId() : null;
    }

    @Named("storeIdToStore")
    default Store storeIdToStore(Long storeId) {
        if (storeId == null) return null;
        Store store = new Store();
        store.setId(storeId);
        return store;
    }
}
