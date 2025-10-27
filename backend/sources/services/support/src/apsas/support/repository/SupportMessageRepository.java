package apsas.support.repository;

import apsas.support.model.entity.SupportMessage;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, UUID> {}
